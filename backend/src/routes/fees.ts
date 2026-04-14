import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get fee structures
router.get('/structures', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, academicYear } = req.query;
    const where: Record<string, unknown> = {};
    if (classId) where.classId = classId;
    if (academicYear) where.academicYear = academicYear;

    const structures = await prisma.feeStructure.findMany({
      where,
      include: { class: true, _count: { select: { payments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(structures);
  } catch (error) {
    console.error('Get fee structures error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create fee structure
router.post(
  '/structures',
  [
    authenticate,
    authorize('ADMIN', 'ACCOUNTANT'),
    body('name').notEmpty(),
    body('amount').isNumeric(),
    body('classId').notEmpty(),
    body('term').notEmpty(),
    body('academicYear').notEmpty(),
    body('dueDate').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, amount, description, classId, term, academicYear, dueDate } = req.body;
      const structure = await prisma.feeStructure.create({
        data: { name, amount: parseFloat(amount), description, classId, term, academicYear, dueDate: new Date(dueDate) },
        include: { class: true },
      });
      res.status(201).json(structure);
    } catch (error) {
      console.error('Create fee structure error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get payments
router.get('/payments', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, status } = req.query;
    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        feeStructure: { include: { class: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record payment
router.post(
  '/payments',
  [
    authenticate,
    authorize('ADMIN', 'ACCOUNTANT'),
    body('studentId').notEmpty(),
    body('feeStructureId').notEmpty(),
    body('amountPaid').isNumeric(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { studentId, feeStructureId, amountPaid, paymentMethod, receiptNumber, remarks } = req.body;

      const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
      if (!feeStructure) {
        res.status(404).json({ error: 'Fee structure not found' });
        return;
      }

      // Calculate total paid for this fee
      const existingPayments = await prisma.feePayment.findMany({
        where: { studentId, feeStructureId, status: { in: ['PAID', 'PARTIAL'] } },
      });
      const totalPaid = existingPayments.reduce((sum, p) => sum + p.amountPaid, 0) + parseFloat(amountPaid);
      const status = totalPaid >= feeStructure.amount ? 'PAID' : 'PARTIAL';

      const payment = await prisma.feePayment.create({
        data: {
          studentId,
          feeStructureId,
          amountPaid: parseFloat(amountPaid),
          paymentMethod,
          receiptNumber,
          status,
          remarks,
        },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          feeStructure: true,
        },
      });
      res.status(201).json(payment);
    } catch (error) {
      console.error('Record payment error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get student fee summary
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: String(req.params.studentId) },
      include: { class: true, user: { select: { firstName: true, lastName: true } } },
    });

    if (!student || !student.classId) {
      res.status(404).json({ error: 'Student or class not found' });
      return;
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where: { classId: student.classId },
    });

    const feeSummary = await Promise.all(
      feeStructures.map(async (fs) => {
        const payments = await prisma.feePayment.findMany({
          where: { studentId: String(req.params.studentId), feeStructureId: fs.id },
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return {
          feeStructure: fs,
          totalPaid,
          balance: fs.amount - totalPaid,
          status: totalPaid >= fs.amount ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID',
          payments,
        };
      })
    );

    res.json({ student, feeSummary });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Financial report
router.get('/report', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicYear, term } = req.query;
    const where: Record<string, unknown> = {};
    if (academicYear) where.academicYear = academicYear;
    if (term) where.term = term;

    const structures = await prisma.feeStructure.findMany({
      where,
      include: { class: true, payments: true },
    });

    const totalExpected = structures.reduce((sum, s) => sum + s.amount, 0);
    const totalCollected = structures.reduce(
      (sum, s) => sum + s.payments.reduce((pSum, p) => pSum + p.amountPaid, 0),
      0
    );

    res.json({
      structures,
      summary: {
        totalExpected,
        totalCollected,
        totalOutstanding: totalExpected - totalCollected,
        collectionRate: totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
