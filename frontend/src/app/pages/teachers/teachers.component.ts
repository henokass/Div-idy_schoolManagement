import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Teachers</h1>
        <div class="flex gap-3">
          <input type="text" [(ngModel)]="search" placeholder="Search teachers..." class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
          <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Teacher</button>
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
                <th class="text-left px-6 py-3 font-medium text-gray-500">Employee ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Qualification</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Subjects</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Classes</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (teacher of filteredTeachers; track teacher.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{teacher.user.firstName}} {{teacher.user.lastName}}</td>
                  <td class="px-6 py-4">{{teacher.employeeId}}</td>
                  <td class="px-6 py-4">{{teacher.qualification || 'N/A'}}</td>
                  <td class="px-6 py-4">
                    @for (s of teacher.subjects; track s.id) {
                      <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-1">{{s.name}}</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    @for (c of teacher.classes; track c.id) {
                      <span class="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-1">{{c.name}}</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <button (click)="deleteTeacher(teacher.id)" class="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">Add Teacher</h2>
            <form (ngSubmit)="addTeacher()">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium mb-1">Username</label><input [(ngModel)]="newTeacher.username" name="username" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Password</label><input [(ngModel)]="newTeacher.password" name="password" type="password" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">First Name</label><input [(ngModel)]="newTeacher.firstName" name="firstName" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Last Name</label><input [(ngModel)]="newTeacher.lastName" name="lastName" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Employee ID</label><input [(ngModel)]="newTeacher.employeeId" name="empId" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Qualification</label><input [(ngModel)]="newTeacher.qualification" name="qual" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium mb-1">Email</label><input [(ngModel)]="newTeacher.email" name="email" type="email" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium mb-1">Phone</label><input [(ngModel)]="newTeacher.phone" name="phone" class="w-full px-3 py-2 border rounded-lg"></div>
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
export class TeachersComponent implements OnInit {
  teachers: any[] = [];
  loading = true;
  search = '';
  showAdd = false;
  newTeacher: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getTeachers().subscribe({ next: (res) => { this.teachers = res; this.loading = false; }, error: () => this.loading = false }); }

  get filteredTeachers() {
    if (!this.search) return this.teachers;
    const s = this.search.toLowerCase();
    return this.teachers.filter(t => `${t.user.firstName} ${t.user.lastName} ${t.employeeId}`.toLowerCase().includes(s));
  }

  addTeacher() {
    this.api.createTeacher(this.newTeacher).subscribe({ next: () => { this.showAdd = false; this.newTeacher = {}; this.load(); } });
  }

  deleteTeacher(id: number) {
    if (confirm('Delete this teacher?')) { this.api.deleteTeacher(id).subscribe({ next: () => this.load() }); }
  }
}
