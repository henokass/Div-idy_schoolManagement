import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-indigo-800 text-white flex flex-col">
        <div class="p-4 border-b border-indigo-700">
          <h1 class="text-xl font-bold">Golden Academy</h1>
          <p class="text-indigo-300 text-sm">School Management System</p>
        </div>
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          @for (item of menuItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-indigo-900 text-white"
               class="flex items-center px-3 py-2 rounded-lg text-indigo-200 hover:bg-indigo-700 hover:text-white transition">
              <i [class]="item.icon + ' mr-3 text-lg'"></i>
              <span>{{item.label}}</span>
            </a>
          }
        </nav>
        <div class="p-4 border-t border-indigo-700">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              {{user?.firstName?.charAt(0)}}{{user?.lastName?.charAt(0)}}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">{{user?.firstName}} {{user?.lastName}}</p>
              <p class="text-xs text-indigo-300">{{user?.role}}</p>
            </div>
          </div>
          <button (click)="logout()" class="w-full px-3 py-2 text-sm bg-indigo-700 rounded hover:bg-indigo-600 transition">
            Sign Out
          </button>
        </div>
      </aside>
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {
  user: any;
  menuItems: { path: string; label: string; icon: string }[] = [];

  constructor(private auth: AuthService, private router: Router) {
    this.user = this.auth.currentUser;
    this.buildMenu();
  }

  private buildMenu() {
    const role = this.user?.role || '';
    const all = [
      { path: '/dashboard', label: 'Dashboard', icon: 'pi pi-home', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
      { path: '/students', label: 'Students', icon: 'pi pi-users', roles: ['ADMIN', 'TEACHER'] },
      { path: '/teachers', label: 'Teachers', icon: 'pi pi-id-card', roles: ['ADMIN'] },
      { path: '/classes', label: 'Classes', icon: 'pi pi-building', roles: ['ADMIN', 'TEACHER'] },
      { path: '/subjects', label: 'Subjects', icon: 'pi pi-book', roles: ['ADMIN', 'TEACHER'] },
      { path: '/attendance', label: 'Attendance', icon: 'pi pi-check-square', roles: ['ADMIN', 'TEACHER'] },
      { path: '/grades', label: 'Grades', icon: 'pi pi-chart-bar', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { path: '/timetable', label: 'Timetable', icon: 'pi pi-calendar', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
      { path: '/fees', label: 'Fees', icon: 'pi pi-wallet', roles: ['ADMIN', 'ACCOUNTANT'] },
      { path: '/library', label: 'Library', icon: 'pi pi-bookmark', roles: ['ADMIN', 'STUDENT'] },
      { path: '/notifications', label: 'Notifications', icon: 'pi pi-bell', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
      { path: '/announcements', label: 'Announcements', icon: 'pi pi-megaphone', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
      { path: '/reports', label: 'Reports', icon: 'pi pi-chart-line', roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
    ];
    this.menuItems = all.filter(item => item.roles.includes(role));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
