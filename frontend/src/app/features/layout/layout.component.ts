import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="sidebar w-64 bg-white shadow-lg flex flex-col">
        <div class="p-6 border-b border-gray-100">
          <h1 class="text-xl font-bold text-primary-700">
            <i class="pi pi-building mr-2"></i>Golden Academy
          </h1>
          <p class="text-xs text-gray-500 mt-1">School Management System</p>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-link">
            <i class="pi pi-th-large"></i>
            <span>Dashboard</span>
          </a>

          @if (authService.hasRole(['Admin', 'Teacher'])) {
            <a routerLink="/students" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-users"></i>
              <span>Students</span>
            </a>
          }

          @if (authService.hasRole(['Admin'])) {
            <a routerLink="/staff" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-id-card"></i>
              <span>Staff</span>
            </a>
          }

          @if (authService.hasRole(['Admin'])) {
            <a routerLink="/classes" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-table"></i>
              <span>Classes</span>
            </a>
            <a routerLink="/subjects" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-book"></i>
              <span>Subjects</span>
            </a>
          }

          @if (authService.hasRole(['Admin', 'Teacher'])) {
            <a routerLink="/attendance" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-calendar-plus"></i>
              <span>Attendance</span>
            </a>
          }

          <a routerLink="/exams" routerLinkActive="active" class="sidebar-link">
            <i class="pi pi-file-edit"></i>
            <span>Exams</span>
          </a>

          <a routerLink="/grades" routerLinkActive="active" class="sidebar-link">
            <i class="pi pi-chart-bar"></i>
            <span>Grades</span>
          </a>

          @if (authService.hasRole(['Admin', 'Accountant'])) {
            <a routerLink="/fees" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-wallet"></i>
              <span>Fees</span>
            </a>
          }

          <a routerLink="/timetable" routerLinkActive="active" class="sidebar-link">
            <i class="pi pi-clock"></i>
            <span>Timetable</span>
          </a>

          <a routerLink="/library" routerLinkActive="active" class="sidebar-link">
            <i class="pi pi-bookmark"></i>
            <span>Library</span>
          </a>

          @if (authService.hasRole(['Admin'])) {
            <a routerLink="/notifications" routerLinkActive="active" class="sidebar-link">
              <i class="pi pi-bell"></i>
              <span>Notifications</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <i class="pi pi-user text-primary-700"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">{{ authService.currentUser?.username }}</p>
              <p class="text-xs text-gray-500">{{ authService.currentUser?.role }}</p>
            </div>
          </div>
          <button (click)="authService.logout()" class="w-full text-left sidebar-link text-red-500 hover:bg-red-50 hover:text-red-700">
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Welcome back, {{ authService.currentUser?.username }}!</h2>
            <p class="text-sm text-gray-500">{{ today | date:'fullDate' }}</p>
          </div>
          <div class="flex items-center gap-4">
            <button class="relative p-2 text-gray-500 hover:text-gray-700">
              <i class="pi pi-bell text-lg"></i>
            </button>
          </div>
        </header>

        <div class="p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  today = new Date();

  constructor(public authService: AuthService) {}
}
