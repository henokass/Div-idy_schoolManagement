import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Grade, Student, Subject, Exam } from '../../core/models/models';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Grades</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Grade' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex gap-4">
          <select [(ngModel)]="filterExamId" (ngModelChange)="loadGrades()" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option [ngValue]="undefined">All Exams</option>
            @for (e of exams; track e.id) { <option [ngValue]="e.id">{{ e.name }}</option> }
          </select>
          <select [(ngModel)]="filterSubjectId" (ngModelChange)="loadGrades()" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option [ngValue]="undefined">All Subjects</option>
            @for (s of subjects; track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
          </select>
        </div>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Add Grade</h3>
          <form (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select [(ngModel)]="form.studentId" name="studentId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (s of students; track s.id) { <option [ngValue]="s.id">{{ s.firstName }} {{ s.lastName }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select [(ngModel)]="form.subjectId" name="subjectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (s of subjects; track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select [(ngModel)]="form.examId" name="examId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (e of exams; track e.id) { <option [ngValue]="e.id">{{ e.name }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                <input type="number" [(ngModel)]="form.marksObtained" name="marksObtained" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input type="number" [(ngModel)]="form.maxMarks" name="maxMarks" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select [(ngModel)]="form.gradeLetter" name="gradeLetter" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="A+">A+</option><option value="A">A</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B">B</option><option value="B-">B-</option>
                  <option value="C+">C+</option><option value="C">C</option><option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
              <button type="button" (click)="showForm = false" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Student</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Exam</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Marks</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Grade</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (g of grades; track g.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-medium">{{ g.studentName }}</td>
                <td class="py-3 px-4">{{ g.subjectName }}</td>
                <td class="py-3 px-4">{{ g.examName }}</td>
                <td class="py-3 px-4">{{ g.marksObtained }}/{{ g.maxMarks }}</td>
                <td class="py-3 px-4">
                  <span class="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">{{ g.gradeLetter }}</span>
                </td>
                <td class="py-3 px-4">
                  <button (click)="deleteGrade(g.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="py-8 text-center text-gray-500">No grades found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class GradesComponent implements OnInit {
  grades: Grade[] = [];
  students: Student[] = [];
  subjects: Subject[] = [];
  exams: Exam[] = [];
  showForm = false;
  filterExamId?: number;
  filterSubjectId?: number;
  form: any = { gradeLetter: 'A' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadGrades();
    this.apiService.getStudents().subscribe(s => this.students = s);
    this.apiService.getSubjects().subscribe(s => this.subjects = s);
    this.apiService.getExams().subscribe(e => this.exams = e);
  }

  loadGrades(): void {
    this.apiService.getGrades(undefined, this.filterExamId, this.filterSubjectId).subscribe(g => this.grades = g);
  }

  save(): void {
    this.apiService.createGrade(this.form).subscribe(() => {
      this.loadGrades();
      this.showForm = false;
      this.form = { gradeLetter: 'A' };
    });
  }

  deleteGrade(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteGrade(id).subscribe(() => this.loadGrades());
  }
}
