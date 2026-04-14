import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all announcements
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { audience } = req.query;
    const where: Record<string, unknown> = { isActive: true };
    if (audience) where.audience = audience;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post(
  '/',
  [
    authenticate,
    authorize('ADMIN'),
    body('title').notEmpty(),
    body('content').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, content, audience } = req.body;
      const announcement = await prisma.announcement.create({
        data: { title, content, audience: audience || 'ALL' },
      });
      res.status(201).json(announcement);
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update announcement
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, audience, isActive } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id: String(req.params.id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(audience && { audience }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(announcement);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.announcement.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
