import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Grades</h1>
        <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Grade</button>
      </div>
      <div class="flex gap-4 mb-6">
        <select [(ngModel)]="filterTerm" (ngModelChange)="load()" class="px-4 py-2 border rounded-lg">
          <option value="">All Terms</option>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Subject</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Score</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Grade</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Exam Type</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Term</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (grade of grades; track grade.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{grade.student.user.firstName}} {{grade.student.user.lastName}}</td>
                  <td class="px-6 py-4">{{grade.subject.name}}</td>
                  <td class="px-6 py-4">{{grade.score}}/{{grade.maxScore}}</td>
                  <td class="px-6 py-4"><span [class]="'px-2 py-1 rounded text-xs font-bold ' + gradeColor(grade.grade)">{{grade.grade}}</span></td>
                  <td class="px-6 py-4">{{grade.examType}}</td>
                  <td class="px-6 py-4">{{grade.term}}</td>
                  <td class="px-6 py-4"><button (click)="deleteGrade(grade.id)" class="text-red-600 hover:text-red-800">Delete</button></td>
                </tr>
              }
            </tbody>
          </table>
          @if (grades.length === 0) { <div class="text-center py-8 text-gray-500">No grades found</div> }
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">Add Grade</h2>
            <form (ngSubmit)="addGrade()">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium mb-1">Student</label>
                  <select [(ngModel)]="newGrade.studentId" name="studentId" class="w-full px-3 py-2 border rounded-lg" required>
                    @for (s of students; track s.id) { <option [ngValue]="s.id">{{s.user.firstName}} {{s.user.lastName}}</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Subject</label>
                  <select [(ngModel)]="newGrade.subjectId" name="subjectId" class="w-full px-3 py-2 border rounded-lg" required>
                    @for (s of subjects; track s.id) { <option [ngValue]="s.id">{{s.name}}</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Score</label><input [(ngModel)]="newGrade.score" name="score" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Max Score</label><input [(ngModel)]="newGrade.maxScore" name="maxScore" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Exam Type</label><input [(ngModel)]="newGrade.examType" name="examType" class="w-full px-3 py-2 border rounded-lg" required placeholder="Midterm, Final..."></div>
                <div><label class="block text-sm font-medium mb-1">Term</label>
                  <select [(ngModel)]="newGrade.term" name="term" class="w-full px-3 py-2 border rounded-lg" required>
                    <option value="Term 1">Term 1</option><option value="Term 2">Term 2</option><option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div class="col-span-2"><label class="block text-sm font-medium mb-1">Academic Year</label><input [(ngModel)]="newGrade.academicYear" name="ay" class="w-full px-3 py-2 border rounded-lg" required placeholder="2024/2025"></div>
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
export class GradesComponent implements OnInit {
  grades: any[] = [];
  students: any[] = [];
  subjects: any[] = [];
  loading = true;
  showAdd = false;
  filterTerm = '';
  newGrade: any = { maxScore: 100, term: 'Term 1', academicYear: '2024/2025' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getStudents().subscribe({ next: (res) => this.students = res });
    this.api.getSubjects().subscribe({ next: (res) => this.subjects = res });
  }

  load() {
    const params: any = {};
    if (this.filterTerm) params.term = this.filterTerm;
    this.api.getGrades(params).subscribe({ next: (res) => { this.grades = res; this.loading = false; }, error: () => this.loading = false });
  }

  gradeColor(grade: string): string {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  addGrade() { this.api.createGrade(this.newGrade).subscribe({ next: () => { this.showAdd = false; this.newGrade = { maxScore: 100, term: 'Term 1', academicYear: '2024/2025' }; this.load(); } }); }
  deleteGrade(id: number) { if (confirm('Delete?')) { this.api.deleteGrade(id).subscribe({ next: () => this.load() }); } }
}
