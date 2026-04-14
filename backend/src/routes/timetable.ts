import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get timetable for a class
router.get('/class/:classId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slots = await prisma.timetableSlot.findMany({
      where: { classId: String(req.params.classId) },
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: true,
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    res.json(slots);
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get timetable for a teacher
router.get('/teacher/:teacherId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slots = await prisma.timetableSlot.findMany({
      where: { teacherId: String(req.params.teacherId) },
      include: {
        subject: true,
        class: true,
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    res.json(slots);
  } catch (error) {
    console.error('Get teacher timetable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create timetable slot
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('day').notEmpty(),
    body('startTime').notEmpty(),
    body('endTime').notEmpty(),
    body('classId').notEmpty(),
    body('subjectId').notEmpty(),
    body('teacherId').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { day, startTime, endTime, classId, subjectId, teacherId, room } = req.body;
      const slot = await prisma.timetableSlot.create({
        data: { day, startTime, endTime, classId, subjectId, teacherId, room },
        include: {
          subject: true,
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          class: true,
        },
      });
      res.status(201).json(slot);
    } catch (error) {
      console.error('Create timetable slot error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update timetable slot
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { day, startTime, endTime, classId, subjectId, teacherId, room } = req.body;
    const slot = await prisma.timetableSlot.update({
      where: { id: String(req.params.id) },
      data: {
        ...(day && { day }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(classId && { classId }),
        ...(subjectId && { subjectId }),
        ...(teacherId && { teacherId }),
        ...(room !== undefined && { room }),
      },
    });
    res.json(slot);
  } catch (error) {
    console.error('Update timetable slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete timetable slot
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.timetableSlot.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Timetable slot deleted successfully' });
  } catch (error) {
    console.error('Delete timetable slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
