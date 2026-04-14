import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get grades (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, subjectId, term, academicYear } = req.query;
    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record grade
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN', 'TEACHER'),
    body('studentId').notEmpty(),
    body('subjectId').notEmpty(),
    body('examType').notEmpty(),
    body('score').isNumeric(),
    body('term').notEmpty(),
    body('academicYear').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { studentId, subjectId, examType, score, maxScore, grade, remarks, term, academicYear } = req.body;

      const gradeRecord = await prisma.grade.create({
        data: {
          studentId,
          subjectId,
          examType,
          score: parseFloat(score),
          maxScore: maxScore ? parseFloat(maxScore) : 100,
          grade: grade || calculateGrade(parseFloat(score), maxScore ? parseFloat(maxScore) : 100),
          remarks,
          term,
          academicYear,
        },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          subject: true,
        },
      });
      res.status(201).json(gradeRecord);
    } catch (error) {
      console.error('Record grade error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Bulk record grades
router.post(
  '/bulk',
  [authenticate, authorize('ADMIN', 'TEACHER'), body('grades').isArray()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { grades } = req.body;
      const results = await Promise.all(
        grades.map((g: { studentId: string; subjectId: string; examType: string; score: number; maxScore?: number; term: string; academicYear: string; remarks?: string }) =>
          prisma.grade.create({
            data: {
              studentId: g.studentId,
              subjectId: g.subjectId,
              examType: g.examType,
              score: g.score,
              maxScore: g.maxScore || 100,
              grade: calculateGrade(g.score, g.maxScore || 100),
              term: g.term,
              academicYear: g.academicYear,
              remarks: g.remarks,
            },
          })
        )
      );
      res.status(201).json(results);
    } catch (error) {
      console.error('Bulk grade error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get student report card
router.get('/report-card/:studentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { term, academicYear } = req.query;
    const student = await prisma.student.findUnique({
      where: { id: String(req.params.studentId) },
      include: {
        user: { select: { firstName: true, lastName: true } },
        class: true,
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const where: Record<string, unknown> = { studentId: String(req.params.studentId) };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;

    const grades = await prisma.grade.findMany({
      where,
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const totalMaxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
    const average = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100) : 0;

    res.json({
      student,
      grades,
      summary: {
        totalSubjects: grades.length,
        totalScore,
        totalMaxScore,
        average: average.toFixed(1),
        overallGrade: calculateGrade(totalScore, totalMaxScore),
      },
    });
  } catch (error) {
    console.error('Get report card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update grade
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, maxScore, grade, remarks } = req.body;
    const gradeRecord = await prisma.grade.update({
      where: { id: String(req.params.id) },
      data: {
        ...(score !== undefined && { score: parseFloat(score) }),
        ...(maxScore !== undefined && { maxScore: parseFloat(maxScore) }),
        ...(grade !== undefined && { grade }),
        ...(remarks !== undefined && { remarks }),
      },
    });
    res.json(gradeRecord);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete grade
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.grade.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function calculateGrade(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

export default router;
