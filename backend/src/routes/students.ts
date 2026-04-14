import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all students
router.get('/', authenticate, authorize('ADMIN', 'TEACHER'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, username: true, email: true, firstName: true, lastName: true, phone: true, isActive: true } },
        class: true,
        parent: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: String(req.params.id) },
      include: {
        user: { select: { id: true, username: true, email: true, firstName: true, lastName: true, phone: true } },
        class: true,
        parent: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
        grades: { include: { subject: true } },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create student
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('userId').notEmpty(),
    body('admissionNumber').notEmpty(),
    body('dateOfBirth').notEmpty(),
    body('gender').isIn(['MALE', 'FEMALE']),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { userId, admissionNumber, dateOfBirth, gender, address, classId, parentId } = req.body;
      const student = await prisma.student.create({
        data: {
          userId,
          admissionNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address,
          classId,
          parentId,
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } }, class: true },
      });
      res.status(201).json(student);
    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update student
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { admissionNumber, dateOfBirth, gender, address, classId, parentId } = req.body;
    const student = await prisma.student.update({
      where: { id: String(req.params.id) },
      data: {
        ...(admissionNumber && { admissionNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address !== undefined && { address }),
        ...(classId !== undefined && { classId }),
        ...(parentId !== undefined && { parentId }),
      },
      include: { user: { select: { firstName: true, lastName: true, email: true } }, class: true },
    });
    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete student
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({ where: { id: String(req.params.id) } });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    await prisma.student.delete({ where: { id: String(req.params.id) } });
    await prisma.user.delete({ where: { id: student.userId } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
