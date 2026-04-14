import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: req.user!.id },
      include: { sender: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.notification.count({
      where: { receiverId: req.user!.id, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send notification
router.post(
  '/',
  [
    authenticate,
    body('title').notEmpty(),
    body('message').notEmpty(),
    body('receiverId').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, message, receiverId, type } = req.body;
      const notification = await prisma.notification.create({
        data: { title, message, type: type || 'GENERAL', senderId: req.user!.id, receiverId },
      });
      res.status(201).json(notification);
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Send bulk notifications
router.post(
  '/bulk',
  [
    authenticate,
    body('title').notEmpty(),
    body('message').notEmpty(),
    body('receiverIds').isArray(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, message, receiverIds, type } = req.body;
      const notifications = await Promise.all(
        receiverIds.map((receiverId: string) =>
          prisma.notification.create({
            data: { title, message, type: type || 'GENERAL', senderId: req.user!.id, receiverId },
          })
        )
      );
      res.status(201).json(notifications);
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Mark as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { receiverId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
