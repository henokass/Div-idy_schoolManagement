import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
        <button (click)="markAllRead()" class="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">Mark All Read</button>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <div class="space-y-3">
          @for (n of notifications; track n.id) {
            <div (click)="markRead(n)" [class]="'bg-white rounded-xl shadow p-4 cursor-pointer transition hover:shadow-md ' + (n.isRead ? 'opacity-60' : 'border-l-4 border-indigo-500')">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold" [class.text-gray-800]="!n.isRead" [class.text-gray-500]="n.isRead">{{n.title}}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{n.message}}</p>
                  @if (n.sender) {
                    <p class="text-xs text-gray-400 mt-2">From: {{n.sender.firstName}} {{n.sender.lastName}}</p>
                  }
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-400">{{n.createdAt | date:'short'}}</p>
                  @if (!n.isRead) {
                    <span class="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-1"></span>
                  }
                </div>
              </div>
            </div>
          }
          @if (notifications.length === 0) {
            <div class="text-center py-12 text-gray-500">No notifications</div>
          }
        </div>
      }
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getNotifications().subscribe({ next: (res) => { this.notifications = res; this.loading = false; }, error: () => this.loading = false }); }

  markRead(n: any) {
    if (!n.isRead) { this.api.markAsRead(n.id).subscribe({ next: () => { n.isRead = true; } }); }
  }

  markAllRead() { this.api.markAllAsRead().subscribe({ next: () => { this.notifications.forEach(n => n.isRead = true); } }); }
}
