export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT';
  firstName: string;
  lastName: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  admissionNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  enrollmentDate: string;
  classId?: string;
  class?: ClassData;
  parentId?: string;
  parent?: Parent;
  grades?: Grade[];
  attendances?: Attendance[];
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  qualification?: string;
  joinDate: string;
  salary?: number;
  subjects?: { subject: Subject }[];
  classes?: ClassData[];
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  occupation?: string;
  address?: string;
  students?: Student[];
}

export interface ClassData {
  id: string;
  name: string;
  section?: string;
  capacity: number;
  teacherId?: string;
  teacher?: Teacher;
  students?: Student[];
  _count?: { students: number };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  teachers?: { teacher: Teacher }[];
  _count?: { classes: number };
}

export interface Attendance {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  studentId: string;
  student?: Student;
  classId: string;
  class?: ClassData;
}

export interface Grade {
  id: string;
  studentId: string;
  student?: Student;
  subjectId: string;
  subject?: Subject;
  examType: string;
  score: number;
  maxScore: number;
  grade?: string;
  remarks?: string;
  term: string;
  academicYear: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  description?: string;
  classId: string;
  class?: ClassData;
  term: string;
  academicYear: string;
  dueDate: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  student?: Student;
  feeStructureId: string;
  feeStructure?: FeeStructure;
  amountPaid: number;
  paymentDate: string;
  paymentMethod?: string;
  receiptNumber?: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  quantity: number;
  available: number;
  status: 'AVAILABLE' | 'ISSUED' | 'LOST' | 'DAMAGED';
}

export interface BookIssue {
  id: string;
  bookId: string;
  book?: Book;
  studentId: string;
  student?: Student;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  senderId?: string;
  sender?: User;
  receiverId: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  isActive: boolean;
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classId: string;
  class?: ClassData;
  subjectId: string;
  subject?: Subject;
  teacherId: string;
  teacher?: Teacher;
  room?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
