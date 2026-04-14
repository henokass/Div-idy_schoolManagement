import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <p class="text-gray-600 mb-6">Welcome, {{user?.firstName}} {{user?.lastName}} ({{user?.role}})</p>

      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      }

      <!-- Admin Dashboard -->
      @if (user?.role === 'ADMIN' && data?.stats) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">Students</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.students}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Teachers</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.teachers}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <p class="text-sm text-gray-500">Classes</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.classes}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
            <p class="text-sm text-gray-500">Parents</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.parents}}</p>
          </div>
        </div>
      }

      <!-- Teacher Dashboard -->
      @if (user?.role === 'TEACHER' && data?.teacher) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">My Classes</h3>
            @for (cls of data.teacher.classes; track cls.id) {
              <div class="flex justify-between py-2 border-b">
                <span>{{cls.name}} {{cls.section}}</span>
                <span class="text-gray-500">{{cls._count?.students || 0}} students</span>
              </div>
            }
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">My Subjects</h3>
            @for (s of data.teacher.subjects; track s.subject.id) {
              <div class="py-2 border-b">{{s.subject.name}} ({{s.subject.code}})</div>
            }
          </div>
        </div>
      }

      <!-- Student Dashboard -->
      @if (user?.role === 'STUDENT' && data?.student) {
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h3 class="font-semibold text-lg mb-4">My Class</h3>
          <p class="text-gray-700">{{data.student.class?.name}} {{data.student.class?.section}}</p>
        </div>
        @if (data.student.grades?.length) {
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">Recent Grades</h3>
            <table class="w-full text-sm">
              <thead><tr class="border-b"><th class="text-left py-2">Subject</th><th class="text-left py-2">Score</th><th class="text-left py-2">Grade</th></tr></thead>
              <tbody>
                @for (g of data.student.grades; track g.id) {
                  <tr class="border-b"><td class="py-2">{{g.subject.name}}</td><td>{{g.score}}/{{g.maxScore}}</td><td>{{g.grade}}</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- Parent Dashboard -->
      @if (user?.role === 'PARENT' && data?.parent) {
        <div class="bg-white rounded-xl shadow p-6">
          <h3 class="font-semibold text-lg mb-4">My Children</h3>
          @for (s of data.parent.students; track s.user.firstName) {
            <div class="flex justify-between py-2 border-b">
              <span>{{s.user.firstName}} {{s.user.lastName}}</span>
              <span class="text-gray-500">{{s.class?.name || 'Not assigned'}}</span>
            </div>
          }
        </div>
      }

      <!-- Accountant Dashboard -->
      @if (user?.role === 'ACCOUNTANT' && data?.stats) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Total Collected</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.totalCollected | number:'1.2-2'}} Birr</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <p class="text-sm text-gray-500">Pending Payments</p>
            <p class="text-3xl font-bold text-gray-800">{{data.stats.pendingPayments}}</p>
          </div>
        </div>
      }

      <!-- Announcements (all roles) -->
      @if (data?.announcements?.length) {
        <div class="bg-white rounded-xl shadow p-6 mt-6">
          <h3 class="font-semibold text-lg mb-4">Recent Announcements</h3>
          @for (a of data.announcements; track a.id) {
            <div class="py-3 border-b last:border-0">
              <div class="flex justify-between items-start">
                <h4 class="font-medium">{{a.title}}</h4>
                <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">{{a.audience}}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{a.content}}</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: any;
  data: any = null;
  loading = true;

  constructor(private api: ApiService, private auth: AuthService) {
    this.user = this.auth.currentUser;
  }

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
