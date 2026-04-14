import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './features/layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StudentsComponent } from './features/students/students.component';
import { StaffComponent } from './features/staff/staff.component';
import { ClassesComponent } from './features/classes/classes.component';
import { SubjectsComponent } from './features/subjects/subjects.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { ExamsComponent } from './features/exams/exams.component';
import { GradesComponent } from './features/grades/grades.component';
import { FeesComponent } from './features/fees/fees.component';
import { LibraryComponent } from './features/library/library.component';
import { TimetableComponent } from './features/timetable/timetable.component';
import { NotificationsComponent } from './features/notifications/notifications.component';

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
      { path: 'staff', component: StaffComponent },
      { path: 'classes', component: ClassesComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'exams', component: ExamsComponent },
      { path: 'grades', component: GradesComponent },
      { path: 'fees', component: FeesComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'timetable', component: TimetableComponent },
      { path: 'notifications', component: NotificationsComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
