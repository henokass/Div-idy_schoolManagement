import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Classes</h1>
        <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Class</button>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (cls of classes; track cls.id) {
            <div class="bg-white rounded-xl shadow p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold">{{cls.name}}</h3>
                  <p class="text-sm text-gray-500">Section: {{cls.section || 'N/A'}}</p>
                </div>
                <button (click)="deleteClass(cls.id)" class="text-red-400 hover:text-red-600"><i class="pi pi-trash"></i></button>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Capacity:</span><span>{{cls.capacity}}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Students:</span><span>{{cls._count?.students || 0}}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Teacher:</span><span>{{cls.teacher ? cls.teacher.user.firstName + ' ' + cls.teacher.user.lastName : 'Not assigned'}}</span></div>
              </div>
              <div class="mt-3 bg-gray-100 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full" [style.width.%]="cls._count ? (cls._count.students / cls.capacity * 100) : 0"></div>
              </div>
            </div>
          }
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Add Class</h2>
            <form (ngSubmit)="addClass()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Name</label><input [(ngModel)]="newClass.name" name="name" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Section</label><input [(ngModel)]="newClass.section" name="section" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium mb-1">Capacity</label><input [(ngModel)]="newClass.capacity" name="capacity" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
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
export class ClassesComponent implements OnInit {
  classes: any[] = [];
  loading = true;
  showAdd = false;
  newClass: any = { capacity: 40 };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.getClasses().subscribe({ next: (res) => { this.classes = res; this.loading = false; }, error: () => this.loading = false }); }
  addClass() { this.api.createClass(this.newClass).subscribe({ next: () => { this.showAdd = false; this.newClass = { capacity: 40 }; this.load(); } }); }
  deleteClass(id: number) { if (confirm('Delete this class?')) { this.api.deleteClass(id).subscribe({ next: () => this.load() }); } }
}
