import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Exam } from '../../core/models/models';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Exams</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Exam' }}
        </button>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ editing ? 'Edit Exam' : 'Add New Exam' }}</h3>
          <form (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input type="text" [(ngModel)]="form.name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select [(ngModel)]="form.examType" name="examType" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input type="text" [(ngModel)]="form.academicYear" name="academicYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2024-2025">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" [(ngModel)]="form.startDate" name="startDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" [(ngModel)]="form.endDate" name="endDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
        @for (e of exams; track e.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-800">{{ e.name }}</h3>
              <span class="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">{{ e.examType }}</span>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
              <p><i class="pi pi-calendar mr-2"></i>{{ e.startDate | date:'mediumDate' }} - {{ e.endDate | date:'mediumDate' }}</p>
              <p><i class="pi pi-bookmark mr-2"></i>{{ e.academicYear }}</p>
            </div>
            <div class="mt-4 flex gap-2">
              <button (click)="edit(e)" class="text-primary-600 hover:text-primary-800"><i class="pi pi-pencil"></i></button>
              <button (click)="delete(e.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
            </div>
          </div>
        } @empty {
          <div class="col-span-3 text-center py-12 text-gray-500">No exams found</div>
        }
      </div>
    </div>
  `
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  showForm = false;
  editing: Exam | null = null;
  form: any = { examType: 'Midterm' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.apiService.getExams().subscribe(e => this.exams = e); }
  edit(e: Exam): void { this.editing = e; this.form = { ...e }; this.showForm = true; }
  cancel(): void { this.editing = null; this.form = { examType: 'Midterm' }; this.showForm = false; }

  save(): void {
    if (this.editing) {
      this.apiService.updateExam(this.editing.id, this.form).subscribe(() => { this.load(); this.cancel(); });
    } else {
      this.apiService.createExam(this.form).subscribe(() => { this.load(); this.cancel(); });
    }
  }

  delete(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteExam(id).subscribe(() => this.load());
  }
}
