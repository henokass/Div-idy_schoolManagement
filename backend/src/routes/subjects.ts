import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all subjects
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        _count: { select: { classes: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: String(req.params.id) },
      include: {
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        classes: { include: { class: true } },
      },
    });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create subject
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('name').notEmpty(),
    body('code').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, code, description } = req.body;
      const subject = await prisma.subject.create({ data: { name, code, description } });
      res.status(201).json(subject);
    } catch (error) {
      console.error('Create subject error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Assign teacher to subject
router.post('/:id/teachers', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.body;
    const assignment = await prisma.subjectTeacher.create({
      data: { subjectId: String(req.params.id), teacherId },
      include: { subject: true, teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign subject to class
router.post('/:id/classes', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.body;
    const assignment = await prisma.classSubject.create({
      data: { subjectId: String(req.params.id), classId },
      include: { subject: true, class: true },
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assign class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subject
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;
    const subject = await prisma.subject.update({
      where: { id: String(req.params.id) },
      data: { ...(name && { name }), ...(code && { code }), ...(description !== undefined && { description }) },
    });
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subject
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.subject.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
