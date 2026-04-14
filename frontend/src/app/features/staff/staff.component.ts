import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Staff } from '../../core/models/models';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Staff Management</h1>
        @if (authService.hasRole(['Admin'])) {
          <button (click)="showForm = !showForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            <i class="pi pi-plus mr-2"></i>{{ showForm ? 'Cancel' : 'Add Staff' }}
          </button>
        }
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex gap-4">
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadStaff()" placeholder="Search staff..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
          <select [(ngModel)]="selectedDepartment" (ngModelChange)="loadStaff()" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">All Departments</option>
            @for (d of departments; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
        </div>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ editingStaff ? 'Edit Staff' : 'Add New Staff' }}</h3>
          <form (ngSubmit)="saveStaff()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                <input type="text" [(ngModel)]="form.staffIdNumber" name="staffIdNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required [disabled]="!!editingStaff">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" [(ngModel)]="form.firstName" name="firstName" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" [(ngModel)]="form.lastName" name="lastName" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select [(ngModel)]="form.gender" name="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" [(ngModel)]="form.phoneNumber" name="phoneNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" [(ngModel)]="form.department" name="department" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input type="text" [(ngModel)]="form.position" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input type="date" [(ngModel)]="form.hireDate" name="hireDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input type="number" [(ngModel)]="form.salary" name="salary" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" [(ngModel)]="form.address" name="address" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
              <button type="button" (click)="cancelEdit()" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">ID</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Department</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Position</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Email</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              @if (authService.hasRole(['Admin'])) {
                <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (s of staffList; track s.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-xs">{{ s.staffIdNumber }}</td>
                <td class="py-3 px-4 font-medium">{{ s.firstName }} {{ s.lastName }}</td>
                <td class="py-3 px-4">{{ s.department }}</td>
                <td class="py-3 px-4">{{ s.position }}</td>
                <td class="py-3 px-4 text-gray-600">{{ s.email }}</td>
                <td class="py-3 px-4">
                  <span [class]="s.isActive ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs' : 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs'">
                    {{ s.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                @if (authService.hasRole(['Admin'])) {
                  <td class="py-3 px-4">
                    <button (click)="editStaff(s)" class="text-primary-600 hover:text-primary-800 mr-2"><i class="pi pi-pencil"></i></button>
                    <button (click)="deleteStaff(s.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td colspan="7" class="py-8 text-center text-gray-500">No staff found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StaffComponent implements OnInit {
  staffList: Staff[] = [];
  searchTerm = '';
  selectedDepartment = '';
  departments = ['Mathematics', 'Science', 'English', 'History', 'IT', 'Administration', 'Sports'];
  showForm = false;
  editingStaff: Staff | null = null;
  form: any = {};

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void { this.loadStaff(); }

  loadStaff(): void {
    this.apiService.getStaff(this.searchTerm || undefined, this.selectedDepartment || undefined).subscribe(s => this.staffList = s);
  }

  editStaff(staff: Staff): void {
    this.editingStaff = staff;
    this.form = { ...staff };
    this.showForm = true;
  }

  cancelEdit(): void {
    this.editingStaff = null;
    this.form = {};
    this.showForm = false;
  }

  saveStaff(): void {
    if (this.editingStaff) {
      this.apiService.updateStaff(this.editingStaff.id, this.form).subscribe(() => { this.loadStaff(); this.cancelEdit(); });
    } else {
      this.apiService.createStaff(this.form).subscribe(() => { this.loadStaff(); this.cancelEdit(); });
    }
  }

  deleteStaff(id: number): void {
    if (confirm('Are you sure?')) {
      this.apiService.deleteStaff(id).subscribe(() => this.loadStaff());
    }
  }
}
