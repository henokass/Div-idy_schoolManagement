import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Students</h1>
        <div class="flex gap-3">
          <input type="text" [(ngModel)]="search" placeholder="Search students..." class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
          <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Student</button>
        </div>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Admission #</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Class</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Gender</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Parent</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (student of filteredStudents; track student.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{student.user.firstName}} {{student.user.lastName}}</td>
                  <td class="px-6 py-4">{{student.admissionNumber}}</td>
                  <td class="px-6 py-4">{{student.class?.name || 'N/A'}} {{student.class?.section || ''}}</td>
                  <td class="px-6 py-4">{{student.gender}}</td>
                  <td class="px-6 py-4">{{student.parent ? student.parent.user.firstName + ' ' + student.parent.user.lastName : 'N/A'}}</td>
                  <td class="px-6 py-4">
                    <button (click)="deleteStudent(student.id)" class="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          @if (filteredStudents.length === 0) {
            <div class="text-center py-8 text-gray-500">No students found</div>
          }
        </div>
      }

      <!-- Add Student Modal -->
      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">Add Student</h2>
            <form (ngSubmit)="addStudent()">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium mb-1">Username</label><input [(ngModel)]="newStudent.username" name="username" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Password</label><input [(ngModel)]="newStudent.password" name="password" type="password" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">First Name</label><input [(ngModel)]="newStudent.firstName" name="firstName" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Last Name</label><input [(ngModel)]="newStudent.lastName" name="lastName" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Admission #</label><input [(ngModel)]="newStudent.admissionNumber" name="admNo" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Date of Birth</label><input [(ngModel)]="newStudent.dateOfBirth" name="dob" type="date" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Gender</label>
                  <select [(ngModel)]="newStudent.gender" name="gender" class="w-full px-3 py-2 border rounded-lg">
                    <option value="MALE">Male</option><option value="FEMALE">Female</option>
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Email</label><input [(ngModel)]="newStudent.email" name="email" type="email" class="w-full px-3 py-2 border rounded-lg"></div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showAdd = false" class="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  loading = true;
  search = '';
  showAdd = false;
  newStudent: any = { gender: 'MALE' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getStudents().subscribe({ next: (res) => { this.students = res; this.loading = false; }, error: () => this.loading = false });
  }

  get filteredStudents() {
    if (!this.search) return this.students;
    const s = this.search.toLowerCase();
    return this.students.filter(st => `${st.user.firstName} ${st.user.lastName} ${st.admissionNumber}`.toLowerCase().includes(s));
  }

  addStudent() {
    this.api.createStudent(this.newStudent).subscribe({ next: () => { this.showAdd = false; this.newStudent = { gender: 'MALE' }; this.load(); } });
  }

  deleteStudent(id: number) {
    if (confirm('Delete this student?')) {
      this.api.deleteStudent(id).subscribe({ next: () => this.load() });
    }
  }
}
