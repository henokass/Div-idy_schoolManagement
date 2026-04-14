import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Timetable</h1>
      <div class="flex gap-4 mb-6">
        <select [(ngModel)]="selectedClassId" (ngModelChange)="loadTimetable()" class="px-4 py-2 border rounded-lg">
          <option [ngValue]="null">Select class...</option>
          @for (cls of classes; track cls.id) {
            <option [ngValue]="cls.id">{{cls.name}} {{cls.section}}</option>
          }
        </select>
      </div>

      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else if (selectedClassId) {
        <div class="bg-white rounded-xl shadow overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-500 w-20">Time</th>
                @for (day of days; track day) {
                  <th class="px-4 py-3 font-medium text-gray-500">{{day}}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (time of timeSlots; track time) {
                <tr class="border-t">
                  <td class="px-4 py-3 text-xs text-gray-500 font-medium">{{time}}</td>
                  @for (day of days; track day) {
                    <td class="px-2 py-2">
                      @if (getSlot(day, time); as slot) {
                        <div class="p-2 rounded-lg text-xs" [class]="slotColor(slot.subject.name)">
                          <div class="font-semibold">{{slot.subject.name}}</div>
                          <div class="opacity-75">{{slot.teacher.user.firstName}} {{slot.teacher.user.lastName}}</div>
                          @if (slot.room) { <div class="opacity-60">{{slot.room}}</div> }
                        </div>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">Select a class to view timetable</div>
      }
    </div>
  `
})
export class TimetableComponent implements OnInit {
  classes: any[] = [];
  slots: any[] = [];
  selectedClassId: number | null = null;
  loading = false;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  colors: Record<string, string> = {};
  colorPalette = [
    'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800', 'bg-pink-100 text-pink-800', 'bg-teal-100 text-teal-800',
    'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.api.getClasses().subscribe({ next: (res) => this.classes = res }); }

  loadTimetable() {
    if (!this.selectedClassId) return;
    this.loading = true;
    this.api.getTimetableByClass(this.selectedClassId).subscribe({
      next: (res) => { this.slots = res; this.assignColors(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  assignColors() {
    const subjects = [...new Set(this.slots.map(s => s.subject.name))];
    subjects.forEach((name, i) => { this.colors[name] = this.colorPalette[i % this.colorPalette.length]; });
  }

  getSlot(day: string, time: string): any {
    return this.slots.find(s => s.day === day && s.startTime === time);
  }

  slotColor(subject: string): string { return this.colors[subject] || 'bg-gray-100 text-gray-800'; }
}
