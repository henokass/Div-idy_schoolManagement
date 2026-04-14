import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Academic report - class performance
router.get('/academic/class/:classId', authenticate, authorize('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { term, academicYear } = req.query;
    const where: Record<string, unknown> = {};
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;

    const students = await prisma.student.findMany({
      where: { classId: String(req.params.classId) },
      include: {
        user: { select: { firstName: true, lastName: true } },
        grades: { where, include: { subject: true } },
      },
    });

    const classPerformance = students.map(student => {
      const totalScore = student.grades.reduce((sum, g) => sum + g.score, 0);
      const totalMaxScore = student.grades.reduce((sum, g) => sum + g.maxScore, 0);
      const average = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100) : 0;

      return {
        student: { id: student.id, name: `${student.user.firstName} ${student.user.lastName}` },
        totalScore,
        totalMaxScore,
        average: average.toFixed(1),
        subjectCount: student.grades.length,
      };
    });

    classPerformance.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

    // Add rank
    const ranked = classPerformance.map((s, i) => ({ ...s, rank: i + 1 }));

    res.json({
      classId: String(req.params.classId),
      students: ranked,
      classAverage: classPerformance.length > 0
        ? (classPerformance.reduce((sum, s) => sum + parseFloat(s.average), 0) / classPerformance.length).toFixed(1)
        : '0',
    });
  } catch (error) {
    console.error('Class report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Attendance report
router.get('/attendance', authenticate, authorize('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, startDate, endDate } = req.query;
    const where: Record<string, unknown> = {};
    if (classId) where.classId = classId;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const attendances = await prisma.attendance.findMany({ where });

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;

    res.json({
      total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : '0',
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fee collection report
router.get('/fees', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicYear } = req.query;
    const where: Record<string, unknown> = {};
    if (academicYear) where.academicYear = academicYear;

    const structures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: true,
        payments: true,
      },
    });

    const report = structures.map(s => ({
      feeStructure: { id: s.id, name: s.name, amount: s.amount, class: s.class.name },
      totalCollected: s.payments.reduce((sum, p) => sum + p.amountPaid, 0),
      totalExpected: s.amount,
      paymentCount: s.payments.length,
    }));

    res.json(report);
  } catch (error) {
    console.error('Fee report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Student count report
router.get('/overview', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [studentCount, teacherCount, classCount, subjectCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
    ]);

    const classCounts = await prisma.class.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    });

    res.json({
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalSubjects: subjectCount,
      classDistribution: classCounts.map(c => ({ name: c.name, section: c.section, students: c._count.students })),
    });
  } catch (error) {
    console.error('Overview report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
