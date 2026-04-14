import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Announcements</h1>
        @if (isAdmin) {
          <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">New Announcement</button>
        }
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="space-y-4">
          @for (a of announcements; track a.id) {
            <div class="bg-white rounded-xl shadow p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{a.title}}</h3>
                  <p class="text-gray-600 mt-2">{{a.content}}</p>
                  <div class="flex gap-2 mt-3">
                    <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{{a.audience}}</span>
                    <span class="text-xs text-gray-400">{{a.createdAt | date:'medium'}}</span>
                  </div>
                </div>
                @if (isAdmin) {
                  <button (click)="deleteAnnouncement(a.id)" class="text-red-400 hover:text-red-600"><i class="pi pi-trash"></i></button>
                }
              </div>
            </div>
          }
          @if (announcements.length === 0) {
            <div class="text-center py-12 text-gray-500">No announcements</div>
          }
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">New Announcement</h2>
            <form (ngSubmit)="addAnnouncement()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Title</label><input [(ngModel)]="newAnnouncement.title" name="title" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Content</label><textarea [(ngModel)]="newAnnouncement.content" name="content" class="w-full px-3 py-2 border rounded-lg" rows="4" required></textarea></div>
                <div><label class="block text-sm font-medium mb-1">Audience</label>
                  <select [(ngModel)]="newAnnouncement.audience" name="audience" class="w-full px-3 py-2 border rounded-lg">
                    <option value="ALL">All</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showAdd = false" class="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Publish</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AnnouncementsComponent implements OnInit {
  announcements: any[] = [];
  loading = true;
  showAdd = false;
  isAdmin = false;
  newAnnouncement: any = { audience: 'ALL' };

  constructor(private api: ApiService, private auth: AuthService) {
    this.isAdmin = auth.currentUser?.role === 'ADMIN';
  }

  ngOnInit() { this.api.getAnnouncements().subscribe({ next: (res) => { this.announcements = res; this.loading = false; }, error: () => this.loading = false }); }
  addAnnouncement() { this.api.createAnnouncement(this.newAnnouncement).subscribe({ next: () => { this.showAdd = false; this.newAnnouncement = { audience: 'ALL' }; this.ngOnInit(); } }); }
  deleteAnnouncement(id: number) { if (confirm('Delete?')) { this.api.deleteAnnouncement(id).subscribe({ next: () => this.ngOnInit() }); } }
}
