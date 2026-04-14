import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Attendance, SchoolClass, Student } from '../../core/models/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Attendance</h1>
        <button (click)="showBulkForm = !showBulkForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showBulkForm ? 'Cancel' : 'Take Attendance' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex gap-4">
          <select [(ngModel)]="filterClassId" (ngModelChange)="loadAttendance()" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option [ngValue]="undefined">All Classes</option>
            @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option> }
          </select>
          <input type="date" [(ngModel)]="filterDate" (ngModelChange)="loadAttendance()" class="px-4 py-2 border border-gray-300 rounded-lg">
        </div>
      </div>

      <!-- Bulk Attendance Form -->
      @if (showBulkForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Record Attendance</h3>
          <div class="flex gap-4 mb-4">
            <select [(ngModel)]="bulkClassId" (ngModelChange)="loadClassStudents()" class="px-4 py-2 border border-gray-300 rounded-lg">
              <option [ngValue]="undefined">Select Class</option>
              @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option> }
            </select>
            <input type="date" [(ngModel)]="bulkDate" class="px-4 py-2 border border-gray-300 rounded-lg">
          </div>

          @if (classStudents.length > 0) {
            <table class="w-full text-sm mb-4">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left py-2 px-4">Student</th>
                  <th class="text-left py-2 px-4">Status</th>
                  <th class="text-left py-2 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of bulkEntries; track entry.studentId; let i = $index) {
                  <tr class="border-t border-gray-100">
                    <td class="py-2 px-4">{{ entry.studentName }}</td>
                    <td class="py-2 px-4">
                      <select [(ngModel)]="entry.status" [name]="'status_' + i" class="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </td>
                    <td class="py-2 px-4">
                      <input type="text" [(ngModel)]="entry.remarks" [name]="'remarks_' + i" class="px-3 py-1 border border-gray-300 rounded-lg text-sm w-full">
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            <button (click)="submitBulkAttendance()" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Save Attendance
            </button>
          }
        </div>
      }

      <!-- Attendance Records -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Student</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (a of attendanceRecords; track a.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">{{ a.date | date:'mediumDate' }}</td>
                <td class="py-3 px-4 font-medium">{{ a.studentName }}</td>
                <td class="py-3 px-4">
                  <span [class]="getStatusClass(a.status)">{{ a.status }}</span>
                </td>
                <td class="py-3 px-4 text-gray-600">{{ a.remarks }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="py-8 text-center text-gray-500">No attendance records found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: Attendance[] = [];
  classes: SchoolClass[] = [];
  classStudents: Student[] = [];
  filterClassId?: number;
  filterDate = '';
  showBulkForm = false;
  bulkClassId?: number;
  bulkDate = new Date().toISOString().split('T')[0];
  bulkEntries: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAttendance();
    this.apiService.getClasses().subscribe(c => this.classes = c);
  }

  loadAttendance(): void {
    this.apiService.getAttendance(this.filterClassId, this.filterDate || undefined).subscribe(a => this.attendanceRecords = a);
  }

  loadClassStudents(): void {
    if (this.bulkClassId) {
      this.apiService.getStudents(undefined, this.bulkClassId).subscribe(students => {
        this.classStudents = students;
        this.bulkEntries = students.map(s => ({
          studentId: s.id,
          studentName: s.firstName + ' ' + s.lastName,
          status: 'Present',
          remarks: ''
        }));
      });
    }
  }

  submitBulkAttendance(): void {
    const statusMap: Record<string, number> = { Present: 0, Absent: 1, Late: 2, Excused: 3 };
    const data = {
      classId: this.bulkClassId,
      date: this.bulkDate,
      entries: this.bulkEntries.map(e => ({
        studentId: e.studentId,
        status: statusMap[e.status] ?? 0,
        remarks: e.remarks
      }))
    };
    this.apiService.bulkCreateAttendance(data).subscribe(() => {
      this.loadAttendance();
      this.showBulkForm = false;
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Present: 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs',
      Absent: 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs',
      Late: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs',
      Excused: 'bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs'
    };
    return map[status] || 'px-2 py-1 rounded-full text-xs';
  }
}
