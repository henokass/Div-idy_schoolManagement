import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all teachers
router.get('/', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { id: true, username: true, email: true, firstName: true, lastName: true, phone: true, isActive: true } },
        subjects: { include: { subject: true } },
        classes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: String(req.params.id) },
      include: {
        user: { select: { id: true, username: true, email: true, firstName: true, lastName: true, phone: true } },
        subjects: { include: { subject: true } },
        classes: true,
      },
    });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }
    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create teacher
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('userId').notEmpty(),
    body('employeeId').notEmpty(),
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
      const { userId, employeeId, dateOfBirth, gender, address, qualification, salary } = req.body;
      const teacher = await prisma.teacher.create({
        data: {
          userId,
          employeeId,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address,
          qualification,
          salary,
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      });
      res.status(201).json(teacher);
    } catch (error) {
      console.error('Create teacher error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update teacher
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, dateOfBirth, gender, address, qualification, salary } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: String(req.params.id) },
      data: {
        ...(employeeId && { employeeId }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address !== undefined && { address }),
        ...(qualification !== undefined && { qualification }),
        ...(salary !== undefined && { salary }),
      },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json(teacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete teacher
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: String(req.params.id) } });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }
    await prisma.teacher.delete({ where: { id: String(req.params.id) } });
    await prisma.user.delete({ where: { id: teacher.userId } });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
