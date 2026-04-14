import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Student, SchoolClass } from '../../core/models/models';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Students</h1>
        @if (authService.hasRole(['Admin'])) {
          <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Student' }}
          </button>
        }
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex gap-4">
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadStudents()" placeholder="Search students..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
          <select [(ngModel)]="selectedClassId" (ngModelChange)="loadStudents()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option [ngValue]="undefined">All Classes</option>
            @for (c of classes; track c.id) {
              <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Add/Edit Form -->
      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ editingStudent ? 'Edit Student' : 'Add New Student' }}</h3>
          <form (ngSubmit)="saveStudent()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input type="text" [(ngModel)]="form.studentIdNumber" name="studentIdNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required [disabled]="!!editingStudent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" [(ngModel)]="form.firstName" name="firstName" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" [(ngModel)]="form.lastName" name="lastName" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select [(ngModel)]="form.gender" name="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" [(ngModel)]="form.phoneNumber" name="phoneNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" [(ngModel)]="form.address" name="address" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select [(ngModel)]="form.classId" name="classId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option [ngValue]="null">No Class</option>
                  @for (c of classes; track c.id) {
                    <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
              <button type="button" (click)="cancelEdit()" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      }

      <!-- Students Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">ID</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Email</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Class</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              @if (authService.hasRole(['Admin'])) {
                <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (student of students; track student.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-xs">{{ student.studentIdNumber }}</td>
                <td class="py-3 px-4 font-medium">{{ student.firstName }} {{ student.lastName }}</td>
                <td class="py-3 px-4 text-gray-600">{{ student.email }}</td>
                <td class="py-3 px-4">{{ student.className || 'Unassigned' }}</td>
                <td class="py-3 px-4">{{ student.gender }}</td>
                <td class="py-3 px-4">
                  <span [class]="student.isActive ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs' : 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs'">
                    {{ student.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                @if (authService.hasRole(['Admin'])) {
                  <td class="py-3 px-4">
                    <button (click)="editStudent(student)" class="text-primary-600 hover:text-primary-800 mr-2"><i class="pi pi-pencil"></i></button>
                    <button (click)="deleteStudent(student.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td colspan="7" class="py-8 text-center text-gray-500">No students found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  classes: SchoolClass[] = [];
  searchTerm = '';
  selectedClassId?: number;
  showForm = false;
  editingStudent: Student | null = null;
  form: any = {};

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.apiService.getClasses().subscribe(c => this.classes = c);
  }

  loadStudents(): void {
    this.apiService.getStudents(this.searchTerm || undefined, this.selectedClassId).subscribe(s => this.students = s);
  }

  editStudent(student: Student): void {
    this.editingStudent = student;
    this.form = { ...student };
    this.showForm = true;
  }

  cancelEdit(): void {
    this.editingStudent = null;
    this.form = {};
    this.showForm = false;
  }

  saveStudent(): void {
    if (this.editingStudent) {
      this.apiService.updateStudent(this.editingStudent.id, this.form).subscribe(() => {
        this.loadStudents();
        this.cancelEdit();
      });
    } else {
      this.apiService.createStudent(this.form).subscribe(() => {
        this.loadStudents();
        this.cancelEdit();
      });
    }
  }

  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.apiService.deleteStudent(id).subscribe(() => this.loadStudents());
    }
  }
}
