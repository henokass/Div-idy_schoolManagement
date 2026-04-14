import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SchoolClass, Staff } from '../../core/models/models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Classes</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Class' }}
        </button>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ editing ? 'Edit Class' : 'Add New Class' }}</h3>
          <form (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input type="text" [(ngModel)]="form.name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input type="text" [(ngModel)]="form.section" name="section" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input type="text" [(ngModel)]="form.academicYear" name="academicYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2024-2025">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                <select [(ngModel)]="form.teacherId" name="teacherId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option [ngValue]="null">None</option>
                  @for (t of teachers; track t.id) {
                    <option [ngValue]="t.id">{{ t.firstName }} {{ t.lastName }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
              <button type="button" (click)="cancel()" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (c of classes; track c.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-800">{{ c.name }} {{ c.section }}</h3>
              <div class="flex gap-1">
                <button (click)="edit(c)" class="text-primary-600 hover:text-primary-800 p-1"><i class="pi pi-pencil text-sm"></i></button>
                <button (click)="delete(c.id)" class="text-red-600 hover:text-red-800 p-1"><i class="pi pi-trash text-sm"></i></button>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <p class="text-gray-600"><i class="pi pi-calendar mr-2"></i>{{ c.academicYear }}</p>
              <p class="text-gray-600"><i class="pi pi-user mr-2"></i>{{ c.teacherName || 'No teacher assigned' }}</p>
              <p class="text-gray-600"><i class="pi pi-users mr-2"></i>{{ c.studentCount }} students</p>
            </div>
          </div>
        } @empty {
          <div class="col-span-3 text-center py-12 text-gray-500">No classes found</div>
        }
      </div>
    </div>
  `
})
export class ClassesComponent implements OnInit {
  classes: SchoolClass[] = [];
  teachers: Staff[] = [];
  showForm = false;
  editing: SchoolClass | null = null;
  form: any = {};

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.apiService.getStaff().subscribe(s => this.teachers = s);
  }

  load(): void { this.apiService.getClasses().subscribe(c => this.classes = c); }

  edit(c: SchoolClass): void { this.editing = c; this.form = { ...c }; this.showForm = true; }
  cancel(): void { this.editing = null; this.form = {}; this.showForm = false; }

  save(): void {
    if (this.editing) {
      this.apiService.updateClass(this.editing.id, this.form).subscribe(() => { this.load(); this.cancel(); });
    } else {
      this.apiService.createClass(this.form).subscribe(() => { this.load(); this.cancel(); });
    }
  }

  delete(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteClass(id).subscribe(() => this.load());
  }
}
