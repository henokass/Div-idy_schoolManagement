import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard data based on role
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, id: userId } = req.user!;

    if (role === 'ADMIN') {
      const [studentCount, teacherCount, classCount, parentCount, recentStudents, announcements, payments] = await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.class.count(),
        prisma.parent.count(),
        prisma.student.findMany({
          take: 5, orderBy: { createdAt: 'desc' },
          include: { user: { select: { firstName: true, lastName: true } }, class: true },
        }),
        prisma.announcement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, where: { isActive: true } }),
        prisma.feePayment.findMany({
          take: 5, orderBy: { paymentDate: 'desc' },
          include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
        }),
      ]);

      res.json({
        stats: { students: studentCount, teachers: teacherCount, classes: classCount, parents: parentCount },
        recentStudents,
        announcements,
        recentPayments: payments,
      });
      return;
    }

    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          classes: { include: { _count: { select: { students: true } } } },
          subjects: { include: { subject: true } },
        },
      });

      const announcements = await prisma.announcement.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        where: { isActive: true, audience: { in: ['ALL', 'TEACHERS'] } },
      });

      res.json({ teacher, announcements });
      return;
    }

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          class: true,
          grades: { take: 10, orderBy: { createdAt: 'desc' }, include: { subject: true } },
          attendances: { take: 10, orderBy: { date: 'desc' } },
        },
      });

      const announcements = await prisma.announcement.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        where: { isActive: true, audience: { in: ['ALL', 'STUDENTS'] } },
      });

      res.json({ student, announcements });
      return;
    }

    if (role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          students: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              class: true,
              grades: { take: 5, orderBy: { createdAt: 'desc' }, include: { subject: true } },
              attendances: { take: 5, orderBy: { date: 'desc' } },
            },
          },
        },
      });

      const announcements = await prisma.announcement.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        where: { isActive: true, audience: { in: ['ALL', 'PARENTS'] } },
      });

      res.json({ parent, announcements });
      return;
    }

    if (role === 'ACCOUNTANT') {
      const [totalPayments, recentPayments, pendingPayments] = await Promise.all([
        prisma.feePayment.aggregate({ _sum: { amountPaid: true } }),
        prisma.feePayment.findMany({
          take: 10, orderBy: { paymentDate: 'desc' },
          include: { student: { include: { user: { select: { firstName: true, lastName: true } } } }, feeStructure: true },
        }),
        prisma.feePayment.count({ where: { status: { in: ['UNPAID', 'PARTIAL'] } } }),
      ]);

      const announcements = await prisma.announcement.findMany({
        take: 5, orderBy: { createdAt: 'desc' }, where: { isActive: true },
      });

      res.json({
        stats: { totalCollected: totalPayments._sum.amountPaid || 0, pendingPayments },
        recentPayments,
        announcements,
      });
      return;
    }

    res.json({ message: 'Dashboard data not available' });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
