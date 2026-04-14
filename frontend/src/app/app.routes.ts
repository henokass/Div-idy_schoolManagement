import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StudentsComponent } from './pages/students/students.component';
import { TeachersComponent } from './pages/teachers/teachers.component';
import { ClassesComponent } from './pages/classes/classes.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { GradesComponent } from './pages/grades/grades.component';
import { TimetableComponent } from './pages/timetable/timetable.component';
import { FeesComponent } from './pages/fees/fees.component';
import { LibraryComponent } from './pages/library/library.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'teachers', component: TeachersComponent },
      { path: 'classes', component: ClassesComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'grades', component: GradesComponent },
      { path: 'timetable', component: TimetableComponent },
      { path: 'fees', component: FeesComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'announcements', component: AnnouncementsComponent },
      { path: 'reports', component: ReportsComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
