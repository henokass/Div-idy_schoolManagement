import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Students
  getStudents(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/students`); }
  getStudent(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/students/${id}`); }
  createStudent(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/students`, data); }
  updateStudent(id: number, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/students/${id}`, data); }
  deleteStudent(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/students/${id}`); }

  // Teachers
  getTeachers(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/teachers`); }
  getTeacher(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/teachers/${id}`); }
  createTeacher(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/teachers`, data); }
  deleteTeacher(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/teachers/${id}`); }

  // Classes
  getClasses(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/classes`); }
  getClass(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/classes/${id}`); }
  createClass(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/classes`, data); }
  deleteClass(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/classes/${id}`); }

  // Subjects
  getSubjects(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/subjects`); }
  createSubject(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/subjects`, data); }
  deleteSubject(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/subjects/${id}`); }

  // Attendance
  getAttendance(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/attendance`, { params }); }
  bulkAttendance(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/attendance/bulk`, data); }
  getClassAttendance(classId: number, date?: string): Observable<any[]> {
    const params: any = {};
    if (date) params.date = date;
    return this.http.get<any[]>(`${this.baseUrl}/attendance/class/${classId}`, { params });
  }

  // Grades
  getGrades(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/grades`, { params }); }
  createGrade(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/grades`, data); }
  deleteGrade(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/grades/${id}`); }
  getReportCard(studentId: number, params?: any): Observable<any> { return this.http.get<any>(`${this.baseUrl}/grades/report-card/${studentId}`, { params }); }

  // Timetable
  getTimetableByClass(classId: number): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/timetable/class/${classId}`); }
  createTimetableSlot(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/timetable`, data); }
  deleteTimetableSlot(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/timetable/${id}`); }

  // Fees
  getFeeStructures(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/fees/structures`, { params }); }
  createFeeStructure(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/fees/structures`, data); }
  getPayments(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/fees/payments`); }
  createPayment(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/fees/payments`, data); }
  getStudentFees(studentId: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/fees/student/${studentId}`); }

  // Library
  getBooks(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/library/books`, { params }); }
  createBook(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/library/books`, data); }
  deleteBook(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/library/books/${id}`); }
  issueBook(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/library/issue`, data); }
  returnBook(issueId: number): Observable<any> { return this.http.put(`${this.baseUrl}/library/return/${issueId}`, {}); }
  getBookIssues(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/library/issues`, { params }); }

  // Notifications
  getNotifications(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/notifications`); }
  getUnreadCount(): Observable<any> { return this.http.get<any>(`${this.baseUrl}/notifications/unread-count`); }
  sendNotification(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/notifications`, data); }
  markAsRead(id: number): Observable<any> { return this.http.put(`${this.baseUrl}/notifications/${id}/read`, {}); }
  markAllAsRead(): Observable<any> { return this.http.put(`${this.baseUrl}/notifications/read-all`, {}); }

  // Announcements
  getAnnouncements(params?: any): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/announcements`, { params }); }
  createAnnouncement(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/announcements`, data); }
  deleteAnnouncement(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/announcements/${id}`); }

  // Reports
  getOverviewReport(): Observable<any> { return this.http.get<any>(`${this.baseUrl}/reports/overview`); }
  getFeesReport(): Observable<any> { return this.http.get<any>(`${this.baseUrl}/reports/fees`); }
  getAttendanceReport(params?: any): Observable<any> { return this.http.get<any>(`${this.baseUrl}/reports/attendance`, { params }); }

  // Dashboard
  getDashboard(): Observable<any> { return this.http.get<any>(`${this.baseUrl}/dashboard`); }
}
