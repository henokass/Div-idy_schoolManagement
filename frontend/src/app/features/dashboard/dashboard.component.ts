import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Dashboard } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Students</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ dashboard?.totalStudents || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-users text-xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Staff</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ dashboard?.totalStaff || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-id-card text-xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Classes</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ dashboard?.totalClasses || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-table text-xl text-purple-600"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Library Books</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ dashboard?.booksInLibrary || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-bookmark text-xl text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Summary -->
      @if (authService.hasRole(['Admin', 'Accountant'])) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Fees Collected</p>
                <p class="text-2xl font-bold text-green-600 mt-1">\${{ dashboard?.totalFeesCollected?.toFixed(2) || '0.00' }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-check-circle text-xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Fees Pending</p>
                <p class="text-2xl font-bold text-red-600 mt-1">\${{ dashboard?.totalFeesPending?.toFixed(2) || '0.00' }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-clock text-xl text-red-600"></i>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Recent Attendance -->
      @if (dashboard && dashboard.recentAttendance && dashboard.recentAttendance.length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Attendance (Last 7 Days)</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-gray-600">Date</th>
                  <th class="text-left py-3 px-4 text-gray-600">Present</th>
                  <th class="text-left py-3 px-4 text-gray-600">Absent</th>
                  <th class="text-left py-3 px-4 text-gray-600">Late</th>
                </tr>
              </thead>
              <tbody>
                @for (a of dashboard!.recentAttendance; track a.date) {
                  <tr class="border-b border-gray-100">
                    <td class="py-3 px-4">{{ a.date | date:'mediumDate' }}</td>
                    <td class="py-3 px-4"><span class="text-green-600 font-medium">{{ a.presentCount }}</span></td>
                    <td class="py-3 px-4"><span class="text-red-600 font-medium">{{ a.absentCount }}</span></td>
                    <td class="py-3 px-4"><span class="text-yellow-600 font-medium">{{ a.lateCount }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.apiService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Failed to load dashboard', err)
    });
  }
}
