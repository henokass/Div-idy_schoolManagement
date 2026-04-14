export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}

export interface Student {
  id: number;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  enrollmentDate: string;
  isActive: boolean;
  className?: string;
  parentName?: string;
  classId?: number;
  parentId?: number;
}

export interface Staff {
  id: number;
  staffIdNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
}

export interface SchoolClass {
  id: number;
  name: string;
  section: string;
  academicYear: string;
  teacherName?: string;
  studentCount: number;
  teacherId?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  className?: string;
  teacherName?: string;
  classId?: number;
  teacherId?: number;
}

export interface Attendance {
  id: number;
  studentId: number;
  studentName: string;
  date: string;
  status: string;
  remarks: string;
}

export interface Exam {
  id: number;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  academicYear: string;
}

export interface Grade {
  id: number;
  studentName: string;
  subjectName: string;
  examName: string;
  marksObtained: number;
  maxMarks: number;
  gradeLetter: string;
  remarks: string;
}

export interface FeeStructure {
  id: number;
  className: string;
  feeType: string;
  amount: number;
  academicYear: string;
  description: string;
}

export interface FeePayment {
  id: number;
  studentName: string;
  feeType: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
}

export interface LibraryBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookIssue {
  id: number;
  bookTitle: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
}

export interface Timetable {
  id: number;
  className: string;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  sentBy: string;
  targetRole: string;
  createdAt: string;
  isRead: boolean;
}

export interface Dashboard {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  totalSubjects: number;
  totalFeesCollected: number;
  totalFeesPending: number;
  booksInLibrary: number;
  recentAttendance: AttendanceSummary[];
}

export interface AttendanceSummary {
  date: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  occupation: string;
  studentNames: string[];
}
