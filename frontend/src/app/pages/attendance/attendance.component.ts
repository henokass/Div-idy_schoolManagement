import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Attendance</h1>
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <div class="flex gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">Class</label>
            <select [(ngModel)]="selectedClassId" (ngModelChange)="loadAttendance()" class="px-4 py-2 border rounded-lg">
              <option [ngValue]="null">Select class...</option>
              @for (cls of classes; track cls.id) {
                <option [ngValue]="cls.id">{{cls.name}} {{cls.section}}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Date</label>
            <input type="date" [(ngModel)]="selectedDate" (ngModelChange)="loadAttendance()" class="px-4 py-2 border rounded-lg">
          </div>
          <button (click)="saveAttendance()" [disabled]="!selectedClassId || records.length === 0"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            Save Attendance
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else if (students.length > 0) {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">#</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (record of records; track record.studentId; let i = $index) {
                <tr class="border-t">
                  <td class="px-6 py-3">{{i + 1}}</td>
                  <td class="px-6 py-3 font-medium">{{record.firstName}} {{record.lastName}}</td>
                  <td class="px-6 py-3">
                    <div class="flex gap-2">
                      @for (status of statuses; track status) {
                        <button (click)="record.status = status"
                                [class]="'px-3 py-1 rounded text-xs font-medium ' + (record.status === status ? statusColors[status] : 'bg-gray-100 text-gray-600')"
                                >{{status}}</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (message) {
          <div class="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{{message}}</div>
        }
      } @else if (selectedClassId) {
        <div class="text-center py-8 text-gray-500">No students in this class</div>
      }
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  classes: any[] = [];
  students: any[] = [];
  records: any[] = [];
  selectedClassId: number | null = null;
  selectedDate = new Date().toISOString().split('T')[0];
  loading = false;
  message = '';
  statuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  statusColors: Record<string, string> = {
    'PRESENT': 'bg-green-500 text-white',
    'ABSENT': 'bg-red-500 text-white',
    'LATE': 'bg-yellow-500 text-white',
    'EXCUSED': 'bg-blue-500 text-white'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getClasses().subscribe({ next: (res) => this.classes = res });
  }

  loadAttendance() {
    if (!this.selectedClassId) return;
    this.loading = true;
    this.message = '';
    // Load class details to get student list
    this.api.getClass(this.selectedClassId).subscribe({
      next: (cls) => {
        this.students = cls.students || [];
        // Load existing attendance for this date
        this.api.getClassAttendance(this.selectedClassId!, this.selectedDate).subscribe({
          next: (existing) => {
            this.records = this.students.map((s: any) => {
              const ex = existing.find((e: any) => e.studentId === s.id);
              return { studentId: s.id, firstName: s.user.firstName, lastName: s.user.lastName, status: ex?.status || 'PRESENT' };
            });
            this.loading = false;
          },
          error: () => {
            this.records = this.students.map((s: any) => ({ studentId: s.id, firstName: s.user.firstName, lastName: s.user.lastName, status: 'PRESENT' }));
            this.loading = false;
          }
        });
      },
      error: () => this.loading = false
    });
  }

  saveAttendance() {
    if (!this.selectedClassId) return;
    const data = {
      classId: this.selectedClassId,
      date: this.selectedDate,
      records: this.records.map(r => ({ studentId: r.studentId, status: r.status }))
    };
    this.api.bulkAttendance(data).subscribe({
      next: () => { this.message = 'Attendance saved successfully!'; },
      error: () => { this.message = 'Error saving attendance'; }
    });
  }
}
