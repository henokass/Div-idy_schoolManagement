import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Subjects</h1>
        <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Subject</button>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Code</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Description</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Teachers</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Classes</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (subject of subjects; track subject.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{subject.name}}</td>
                  <td class="px-6 py-4"><span class="px-2 py-1 bg-gray-100 rounded text-xs">{{subject.code}}</span></td>
                  <td class="px-6 py-4 text-gray-600">{{subject.description || '-'}}</td>
                  <td class="px-6 py-4">
                    @for (t of subject.teachers; track t.teacher.id) {
                      <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-1">{{t.teacher.user.firstName}} {{t.teacher.user.lastName}}</span>
                    }
                  </td>
                  <td class="px-6 py-4">{{subject._count?.classes || 0}}</td>
                  <td class="px-6 py-4">
                    <button (click)="deleteSubject(subject.id)" class="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Add Subject</h2>
            <form (ngSubmit)="addSubject()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Name</label><input [(ngModel)]="newSubject.name" name="name" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Code</label><input [(ngModel)]="newSubject.code" name="code" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Description</label><textarea [(ngModel)]="newSubject.description" name="desc" class="w-full px-3 py-2 border rounded-lg" rows="3"></textarea></div>
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
export class SubjectsComponent implements OnInit {
  subjects: any[] = [];
  loading = true;
  showAdd = false;
  newSubject: any = {};

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.getSubjects().subscribe({ next: (res) => { this.subjects = res; this.loading = false; }, error: () => this.loading = false }); }
  addSubject() { this.api.createSubject(this.newSubject).subscribe({ next: () => { this.showAdd = false; this.newSubject = {}; this.load(); } }); }
  deleteSubject(id: number) { if (confirm('Delete?')) { this.api.deleteSubject(id).subscribe({ next: () => this.load() }); } }
}
