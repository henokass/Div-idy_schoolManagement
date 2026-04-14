import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get attendance records (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, date, studentId } = req.query;
    const where: Record<string, unknown> = {};
    if (classId) where.classId = classId;
    if (date) where.date = new Date(date as string);
    if (studentId) where.studentId = studentId;

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(attendances);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record attendance (bulk)
router.post(
  '/bulk',
  [
    authenticate,
    authorize('ADMIN', 'TEACHER'),
    body('classId').notEmpty(),
    body('date').notEmpty(),
    body('records').isArray(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { classId, date, records } = req.body;
      const teacherId = req.user?.role === 'TEACHER'
        ? (await prisma.teacher.findUnique({ where: { userId: req.user.id } }))?.id
        : undefined;

      // Delete existing records for this class and date
      await prisma.attendance.deleteMany({
        where: { classId, date: new Date(date) },
      });

      const attendanceRecords = await Promise.all(
        records.map((record: { studentId: string; status: string; remarks?: string }) =>
          prisma.attendance.create({
            data: {
              date: new Date(date),
              status: record.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
              remarks: record.remarks,
              studentId: record.studentId,
              classId,
              teacherId,
            },
          })
        )
      );

      res.status(201).json(attendanceRecords);
    } catch (error) {
      console.error('Record attendance error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get attendance report for a student
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const where: Record<string, unknown> = { studentId: String(req.params.studentId) };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: { class: true },
      orderBy: { date: 'desc' },
    });

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;
    const excused = attendances.filter(a => a.status === 'EXCUSED').length;

    res.json({
      records: attendances,
      summary: { total, present, absent, late, excused, percentage: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0' },
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get class attendance for a date
router.get('/class/:classId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const where: Record<string, unknown> = { classId: String(req.params.classId) };
    if (date) where.date = new Date(date as string);

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(attendances);
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
