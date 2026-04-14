import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Notification as AppNotification } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
        <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Send Notification' }}
        </button>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Send Notification</h3>
          <form (ngSubmit)="send()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" [(ngModel)]="form.title" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <select [(ngModel)]="form.targetRole" name="targetRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="All">All</option>
                  <option value="Teacher">Teachers</option>
                  <option value="Student">Students</option>
                  <option value="Parent">Parents</option>
                  <option value="Accountant">Accountants</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea [(ngModel)]="form.message" name="message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required></textarea>
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Send</button>
            </div>
          </form>
        </div>
      }

      <div class="space-y-4">
        @for (n of notifications; track n.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5" [class.border-l-4]="!n.isRead" [class.border-l-primary-500]="!n.isRead">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-800">{{ n.title }}</h3>
                  @if (!n.isRead) {
                    <span class="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">New</span>
                  }
                </div>
                <p class="text-gray-600 text-sm mb-2">{{ n.message }}</p>
                <div class="flex gap-4 text-xs text-gray-400">
                  <span><i class="pi pi-user mr-1"></i>{{ n.sentBy }}</span>
                  <span><i class="pi pi-users mr-1"></i>{{ n.targetRole }}</span>
                  <span><i class="pi pi-clock mr-1"></i>{{ n.createdAt | date:'medium' }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                @if (!n.isRead) {
                  <button (click)="markRead(n.id)" class="text-primary-600 hover:text-primary-800" title="Mark as read"><i class="pi pi-check"></i></button>
                }
                <button (click)="deleteNotification(n.id)" class="text-red-600 hover:text-red-800" title="Delete"><i class="pi pi-trash"></i></button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-gray-500">No notifications</div>
        }
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  showForm = false;
  form: any = { targetRole: 'All' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.apiService.getNotifications().subscribe(n => this.notifications = n); }

  send(): void {
    this.apiService.createNotification(this.form).subscribe(() => {
      this.load();
      this.showForm = false;
      this.form = { targetRole: 'All' };
    });
  }

  markRead(id: number): void {
    this.apiService.markNotificationRead(id).subscribe(() => this.load());
  }

  deleteNotification(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteNotification(id).subscribe(() => this.load());
  }
}
