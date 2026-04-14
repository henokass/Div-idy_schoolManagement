import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all books
router.get('/books', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } },
        { isbn: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;

    const books = await prisma.book.findMany({
      where,
      include: { _count: { select: { issues: true } } },
      orderBy: { title: 'asc' },
    });
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add book
router.post(
  '/books',
  [
    authenticate,
    authorize('ADMIN'),
    body('title').notEmpty(),
    body('author').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, author, isbn, category, quantity } = req.body;
      const book = await prisma.book.create({
        data: { title, author, isbn, category, quantity: quantity || 1, available: quantity || 1 },
      });
      res.status(201).json(book);
    } catch (error) {
      console.error('Add book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update book
router.put('/books/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, isbn, category, quantity, available, status } = req.body;
    const book = await prisma.book.update({
      where: { id: String(req.params.id) },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(isbn !== undefined && { isbn }),
        ...(category !== undefined && { category }),
        ...(quantity !== undefined && { quantity }),
        ...(available !== undefined && { available }),
        ...(status && { status }),
      },
    });
    res.json(book);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete book
router.delete('/books/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.book.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Issue book
router.post(
  '/issue',
  [
    authenticate,
    authorize('ADMIN'),
    body('bookId').notEmpty(),
    body('studentId').notEmpty(),
    body('dueDate').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { bookId, studentId, dueDate } = req.body;

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book || book.available <= 0) {
        res.status(400).json({ error: 'Book not available' });
        return;
      }

      const issue = await prisma.bookIssue.create({
        data: { bookId, studentId, dueDate: new Date(dueDate) },
        include: {
          book: true,
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      });

      await prisma.book.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } },
      });

      res.status(201).json(issue);
    } catch (error) {
      console.error('Issue book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Return book
router.put('/return/:issueId', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await prisma.bookIssue.findUnique({ where: { id: String(req.params.issueId) } });
    if (!issue) {
      res.status(404).json({ error: 'Issue record not found' });
      return;
    }

    if (issue.returnDate) {
      res.status(400).json({ error: 'Book already returned' });
      return;
    }

    const returnDate = new Date();
    let fine = 0;
    if (returnDate > issue.dueDate) {
      const daysLate = Math.ceil((returnDate.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      fine = daysLate * 5; // 5 birr per day late
    }

    const updatedIssue = await prisma.bookIssue.update({
      where: { id: String(req.params.issueId) },
      data: { returnDate, fine },
      include: { book: true, student: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });

    await prisma.book.update({
      where: { id: issue.bookId },
      data: { available: { increment: 1 } },
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get issued books
router.get('/issues', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, returned } = req.query;
    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (returned === 'false') where.returnDate = null;
    if (returned === 'true') where.returnDate = { not: null };

    const issues = await prisma.bookIssue.findMany({
      where,
      include: {
        book: true,
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { issueDate: 'desc' },
    });
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
