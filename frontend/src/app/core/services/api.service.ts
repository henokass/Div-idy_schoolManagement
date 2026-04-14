import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Student, Staff, SchoolClass, Subject, Attendance,
  Exam, Grade, FeeStructure, FeePayment, LibraryBook,
  BookIssue, Timetable, Notification as AppNotification, Dashboard, Parent
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.baseUrl}/dashboard`);
  }

  getTeacherDashboard(teacherId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/teacher/${teacherId}`);
  }

  getStudentDashboard(studentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/student/${studentId}`);
  }

  // Students
  getStudents(search?: string, classId?: number): Observable<Student[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (classId) params = params.set('classId', classId.toString());
    return this.http.get<Student[]>(`${this.baseUrl}/students`, { params });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/students/${id}`);
  }

  createStudent(student: Partial<Student>): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/students`, student);
  }

  updateStudent(id: number, student: Partial<Student>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/students/${id}`, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${id}`);
  }

  // Staff
  getStaff(search?: string, department?: string): Observable<Staff[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (department) params = params.set('department', department);
    return this.http.get<Staff[]>(`${this.baseUrl}/staff`, { params });
  }

  getStaffMember(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.baseUrl}/staff/${id}`);
  }

  createStaff(staff: Partial<Staff>): Observable<Staff> {
    return this.http.post<Staff>(`${this.baseUrl}/staff`, staff);
  }

  updateStaff(id: number, staff: Partial<Staff>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/staff/${id}`, staff);
  }

  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/staff/${id}`);
  }

  // Parents
  getParents(search?: string): Observable<Parent[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Parent[]>(`${this.baseUrl}/parents`, { params });
  }

  createParent(parent: Partial<Parent>): Observable<Parent> {
    return this.http.post<Parent>(`${this.baseUrl}/parents`, parent);
  }

  updateParent(id: number, parent: Partial<Parent>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/parents/${id}`, parent);
  }

  deleteParent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parents/${id}`);
  }

  // Classes
  getClasses(academicYear?: string): Observable<SchoolClass[]> {
    let params = new HttpParams();
    if (academicYear) params = params.set('academicYear', academicYear);
    return this.http.get<SchoolClass[]>(`${this.baseUrl}/classes`, { params });
  }

  createClass(schoolClass: Partial<SchoolClass>): Observable<SchoolClass> {
    return this.http.post<SchoolClass>(`${this.baseUrl}/classes`, schoolClass);
  }

  updateClass(id: number, schoolClass: Partial<SchoolClass>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/classes/${id}`, schoolClass);
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classes/${id}`);
  }

  // Subjects
  getSubjects(classId?: number): Observable<Subject[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId.toString());
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects`, { params });
  }

  createSubject(subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.baseUrl}/subjects`, subject);
  }

  updateSubject(id: number, subject: Partial<Subject>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/subjects/${id}`, subject);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subjects/${id}`);
  }

  // Attendance
  getAttendance(classId?: number, date?: string, studentId?: number): Observable<Attendance[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId.toString());
    if (date) params = params.set('date', date);
    if (studentId) params = params.set('studentId', studentId.toString());
    return this.http.get<Attendance[]>(`${this.baseUrl}/attendance`, { params });
  }

  createAttendance(attendance: any): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.baseUrl}/attendance`, attendance);
  }

  bulkCreateAttendance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance/bulk`, data);
  }

  getAttendanceReport(startDate: string, endDate: string, classId?: number): Observable<any[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    if (classId) params = params.set('classId', classId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/attendance/report`, { params });
  }

  // Exams
  getExams(academicYear?: string): Observable<Exam[]> {
    let params = new HttpParams();
    if (academicYear) params = params.set('academicYear', academicYear);
    return this.http.get<Exam[]>(`${this.baseUrl}/exams`, { params });
  }

  createExam(exam: Partial<Exam>): Observable<Exam> {
    return this.http.post<Exam>(`${this.baseUrl}/exams`, exam);
  }

  updateExam(id: number, exam: Partial<Exam>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/exams/${id}`, exam);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/exams/${id}`);
  }

  // Grades
  getGrades(studentId?: number, examId?: number, subjectId?: number): Observable<Grade[]> {
    let params = new HttpParams();
    if (studentId) params = params.set('studentId', studentId.toString());
    if (examId) params = params.set('examId', examId.toString());
    if (subjectId) params = params.set('subjectId', subjectId.toString());
    return this.http.get<Grade[]>(`${this.baseUrl}/grades`, { params });
  }

  createGrade(grade: any): Observable<Grade> {
    return this.http.post<Grade>(`${this.baseUrl}/grades`, grade);
  }

  updateGrade(id: number, grade: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/grades/${id}`, grade);
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/grades/${id}`);
  }

  getReportCard(studentId: number, examId?: number): Observable<any> {
    let params = new HttpParams();
    if (examId) params = params.set('examId', examId.toString());
    return this.http.get(`${this.baseUrl}/grades/report-card/${studentId}`, { params });
  }

  // Fees
  getFeeStructures(academicYear?: string): Observable<FeeStructure[]> {
    let params = new HttpParams();
    if (academicYear) params = params.set('academicYear', academicYear);
    return this.http.get<FeeStructure[]>(`${this.baseUrl}/fees/structures`, { params });
  }

  createFeeStructure(structure: Partial<FeeStructure>): Observable<FeeStructure> {
    return this.http.post<FeeStructure>(`${this.baseUrl}/fees/structures`, structure);
  }

  updateFeeStructure(id: number, structure: Partial<FeeStructure>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/fees/structures/${id}`, structure);
  }

  deleteFeeStructure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fees/structures/${id}`);
  }

  getFeePayments(studentId?: number, status?: string): Observable<FeePayment[]> {
    let params = new HttpParams();
    if (studentId) params = params.set('studentId', studentId.toString());
    if (status) params = params.set('status', status);
    return this.http.get<FeePayment[]>(`${this.baseUrl}/fees/payments`, { params });
  }

  createFeePayment(payment: any): Observable<FeePayment> {
    return this.http.post<FeePayment>(`${this.baseUrl}/fees/payments`, payment);
  }

  getFinancialSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/fees/summary`);
  }

  // Library
  getBooks(search?: string, category?: string): Observable<LibraryBook[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<LibraryBook[]>(`${this.baseUrl}/library/books`, { params });
  }

  createBook(book: Partial<LibraryBook>): Observable<LibraryBook> {
    return this.http.post<LibraryBook>(`${this.baseUrl}/library/books`, book);
  }

  updateBook(id: number, book: Partial<LibraryBook>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/library/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/library/books/${id}`);
  }

  getBookIssues(studentId?: number, overdue?: boolean): Observable<BookIssue[]> {
    let params = new HttpParams();
    if (studentId) params = params.set('studentId', studentId.toString());
    if (overdue !== undefined) params = params.set('overdue', overdue.toString());
    return this.http.get<BookIssue[]>(`${this.baseUrl}/library/issues`, { params });
  }

  issueBook(data: any): Observable<BookIssue> {
    return this.http.post<BookIssue>(`${this.baseUrl}/library/issues`, data);
  }

  returnBook(issueId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/library/issues/${issueId}/return`, {});
  }

  // Timetable
  getTimetable(classId?: number): Observable<Timetable[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId.toString());
    return this.http.get<Timetable[]>(`${this.baseUrl}/timetable`, { params });
  }

  createTimetable(entry: any): Observable<Timetable> {
    return this.http.post<Timetable>(`${this.baseUrl}/timetable`, entry);
  }

  updateTimetable(id: number, entry: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/timetable/${id}`, entry);
  }

  deleteTimetable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/timetable/${id}`);
  }

  // Notifications
  getNotifications(targetRole?: string): Observable<AppNotification[]> {
    let params = new HttpParams();
    if (targetRole) params = params.set('targetRole', targetRole);
    return this.http.get<AppNotification[]>(`${this.baseUrl}/notifications`, { params });
  }

  createNotification(notification: any): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.baseUrl}/notifications`, notification);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/${id}`);
  }
}
