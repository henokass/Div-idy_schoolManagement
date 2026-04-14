import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Subject, SchoolClass, Staff } from '../../core/models/models';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Subjects</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Subject' }}
        </button>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ editing ? 'Edit Subject' : 'Add New Subject' }}</h3>
          <form (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input type="text" [(ngModel)]="form.name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" [(ngModel)]="form.code" name="code" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" [(ngModel)]="form.description" name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select [(ngModel)]="form.classId" name="classId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option [ngValue]="null">None</option>
                  @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select [(ngModel)]="form.teacherId" name="teacherId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option [ngValue]="null">None</option>
                  @for (t of teachers; track t.id) { <option [ngValue]="t.id">{{ t.firstName }} {{ t.lastName }}</option> }
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

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Code</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Description</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Class</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Teacher</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (s of subjects; track s.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-xs font-medium">{{ s.code }}</td>
                <td class="py-3 px-4 font-medium">{{ s.name }}</td>
                <td class="py-3 px-4 text-gray-600">{{ s.description }}</td>
                <td class="py-3 px-4">{{ s.className || '-' }}</td>
                <td class="py-3 px-4">{{ s.teacherName || '-' }}</td>
                <td class="py-3 px-4">
                  <button (click)="edit(s)" class="text-primary-600 hover:text-primary-800 mr-2"><i class="pi pi-pencil"></i></button>
                  <button (click)="deleteSubject(s.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="py-8 text-center text-gray-500">No subjects found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  classes: SchoolClass[] = [];
  teachers: Staff[] = [];
  showForm = false;
  editing: Subject | null = null;
  form: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.apiService.getClasses().subscribe(c => this.classes = c);
    this.apiService.getStaff().subscribe(s => this.teachers = s);
  }

  load(): void { this.apiService.getSubjects().subscribe(s => this.subjects = s); }
  edit(s: Subject): void { this.editing = s; this.form = { ...s }; this.showForm = true; }
  cancel(): void { this.editing = null; this.form = {}; this.showForm = false; }

  save(): void {
    if (this.editing) {
      this.apiService.updateSubject(this.editing.id, this.form).subscribe(() => { this.load(); this.cancel(); });
    } else {
      this.apiService.createSubject(this.form).subscribe(() => { this.load(); this.cancel(); });
    }
  }

  deleteSubject(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteSubject(id).subscribe(() => this.load());
  }
}
