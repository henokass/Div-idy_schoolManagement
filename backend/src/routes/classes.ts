import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all classes
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: String(req.params.id) },
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        students: { include: { user: { select: { firstName: true, lastName: true } } } },
        subjects: { include: { subject: true } },
        timetableSlots: { include: { subject: true, teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
    });
    if (!classData) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create class
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('name').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, section, capacity, teacherId } = req.body;
      const classData = await prisma.class.create({
        data: { name, section, capacity: capacity || 40, teacherId },
        include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
      });
      res.status(201).json(classData);
    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update class
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, section, capacity, teacherId } = req.body;
    const classData = await prisma.class.update({
      where: { id: String(req.params.id) },
      data: {
        ...(name && { name }),
        ...(section !== undefined && { section }),
        ...(capacity && { capacity }),
        ...(teacherId !== undefined && { teacherId }),
      },
    });
    res.json(classData);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete class
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.class.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
