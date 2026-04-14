export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Student {
  id: number;
  admissionNumber: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  enrollmentDate: string;
  isActive: boolean;
  user: { id: number; firstName: string; lastName: string; email?: string; phone?: string };
  class?: { id: number; name: string; section?: string };
  parent?: { id: number; user: { firstName: string; lastName: string } };
}

export interface Teacher {
  id: number;
  employeeId: string;
  qualification?: string;
  joinDate: string;
  isActive: boolean;
  user: { id: number; firstName: string; lastName: string; email?: string; phone?: string };
  subjects: { id: number; name: string; code: string }[];
  classes: { id: number; name: string; section?: string }[];
}

export interface ClassInfo {
  id: number;
  name: string;
  section?: string;
  capacity: number;
  teacher?: { id: number; user: { firstName: string; lastName: string } };
  _count?: { students: number };
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  teachers: { teacher: { id: number; user: { firstName: string; lastName: string } } }[];
  _count?: { classes: number };
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  studentId: number;
  classId: number;
  student: { user: { firstName: string; lastName: string } };
}

export interface Grade {
  id: number;
  score: number;
  maxScore: number;
  grade?: string;
  examType: string;
  term: string;
  academicYear: string;
  student: { id: number; user: { firstName: string; lastName: string } };
  subject: { id: number; name: string };
}

export interface TimetableSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  classId: number;
  subjectId: number;
  teacherId: number;
  subject: { id: number; name: string };
  teacher: { id: number; user: { firstName: string; lastName: string } };
}

export interface FeeStructure {
  id: number;
  name: string;
  amount: number;
  term: string;
  academicYear: string;
  dueDate: string;
  class: { id: number; name: string; section?: string };
}

export interface FeePayment {
  id: number;
  amountPaid: number;
  paymentDate: string;
  paymentMethod?: string;
  receiptNumber?: string;
  status: string;
  student: { id: number; user: { firstName: string; lastName: string } };
  feeStructure: { id: number; name: string; amount: number };
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  quantity: number;
  available: number;
  status: string;
}

export interface BookIssue {
  id: number;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  book: { id: number; title: string; author: string };
  student: { id: number; user: { firstName: string; lastName: string } };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: { firstName: string; lastName: string };
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  audience: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}
