import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Timetable, SchoolClass, Subject } from '../../core/models/models';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Timetable</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Entry' }}
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <select [(ngModel)]="filterClassId" (ngModelChange)="load()" class="px-4 py-2 border border-gray-300 rounded-lg">
          <option [ngValue]="undefined">All Classes</option>
          @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option> }
        </select>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select [(ngModel)]="form.classId" name="classId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }} {{ c.section }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select [(ngModel)]="form.subjectId" name="subjectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (s of subjects; track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select [(ngModel)]="form.dayOfWeek" name="dayOfWeek" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" [(ngModel)]="form.startTime" name="startTime" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" [(ngModel)]="form.endTime" name="endTime" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </form>
        </div>
      }

      <!-- Timetable Grid by Day -->
      @for (day of days; track day) {
        @if (getEntriesForDay(day).length > 0) {
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">{{ day }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (t of getEntriesForDay(day); track t.id) {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-primary-700">{{ t.subjectName }}</span>
                    <button (click)="deleteEntry(t.id)" class="text-red-400 hover:text-red-600"><i class="pi pi-times text-xs"></i></button>
                  </div>
                  <p class="text-xs text-gray-500">{{ t.className }}</p>
                  <p class="text-sm text-gray-700 mt-1"><i class="pi pi-clock mr-1"></i>{{ t.startTime }} - {{ t.endTime }}</p>
                </div>
              }
            </div>
          </div>
        }
      }

      @if (timetable.length === 0) {
        <div class="text-center py-12 text-gray-500">No timetable entries found</div>
      }
    </div>
  `
})
export class TimetableComponent implements OnInit {
  timetable: Timetable[] = [];
  classes: SchoolClass[] = [];
  subjects: Subject[] = [];
  filterClassId?: number;
  showForm = false;
  form: any = { dayOfWeek: 'Monday' };
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.apiService.getClasses().subscribe(c => this.classes = c);
    this.apiService.getSubjects().subscribe(s => this.subjects = s);
  }

  load(): void { this.apiService.getTimetable(this.filterClassId).subscribe(t => this.timetable = t); }

  getEntriesForDay(day: string): Timetable[] {
    return this.timetable.filter(t => t.dayOfWeek === day);
  }

  save(): void {
    this.apiService.createTimetable(this.form).subscribe(() => {
      this.load();
      this.showForm = false;
      this.form = { dayOfWeek: 'Monday' };
    });
  }

  deleteEntry(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteTimetable(id).subscribe(() => this.load());
  }
}
