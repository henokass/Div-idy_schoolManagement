import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FeeStructure, FeePayment, Student } from '../../core/models/models';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Fee Management</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button (click)="activeTab = 'structures'" [class]="activeTab === 'structures' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Fee Structures</button>
        <button (click)="activeTab = 'payments'" [class]="activeTab === 'payments' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Payments</button>
        <button (click)="activeTab = 'record'" [class]="activeTab === 'record' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Record Payment</button>
      </div>

      <!-- Fee Structures -->
      @if (activeTab === 'structures') {
        <div class="mb-4">
          <button (click)="showStructureForm = !showStructureForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            <i class="pi pi-plus mr-2"></i>Add Structure
          </button>
        </div>

        @if (showStructureForm) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <form (ngSubmit)="saveStructure()">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input type="text" [(ngModel)]="structureForm.className" name="className" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                  <select [(ngModel)]="structureForm.feeType" name="feeType" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Tuition">Tuition</option>
                    <option value="Transport">Transport</option>
                    <option value="Library">Library</option>
                    <option value="Lab">Lab</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="number" [(ngModel)]="structureForm.amount" name="amount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input type="text" [(ngModel)]="structureForm.academicYear" name="academicYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2024-2025">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" [(ngModel)]="structureForm.description" name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
              </div>
              <div class="mt-4">
                <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Save</button>
              </div>
            </form>
          </div>
        }

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Class</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Fee Type</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Academic Year</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (f of feeStructures; track f.id) {
                <tr class="border-t border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium">{{ f.className }}</td>
                  <td class="py-3 px-4">{{ f.feeType }}</td>
                  <td class="py-3 px-4 font-medium">\${{ f.amount.toFixed(2) }}</td>
                  <td class="py-3 px-4">{{ f.academicYear }}</td>
                  <td class="py-3 px-4">
                    <button (click)="deleteStructure(f.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="py-8 text-center text-gray-500">No fee structures found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Payments -->
      @if (activeTab === 'payments') {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Fee Type</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (p of payments; track p.id) {
                <tr class="border-t border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium">{{ p.studentName }}</td>
                  <td class="py-3 px-4">{{ p.feeType }}</td>
                  <td class="py-3 px-4 font-medium">\${{ p.amountPaid.toFixed(2) }}</td>
                  <td class="py-3 px-4">{{ p.paymentDate | date:'mediumDate' }}</td>
                  <td class="py-3 px-4">{{ p.paymentMethod }}</td>
                  <td class="py-3 px-4">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{{ p.status }}</span>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="py-8 text-center text-gray-500">No payments found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Record Payment -->
      @if (activeTab === 'record') {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold mb-4">Record New Payment</h3>
          <form (ngSubmit)="recordPayment()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select [(ngModel)]="paymentForm.studentId" name="studentId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (s of students; track s.id) { <option [ngValue]="s.id">{{ s.firstName }} {{ s.lastName }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
                <select [(ngModel)]="paymentForm.feeStructureId" name="feeStructureId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (f of feeStructures; track f.id) { <option [ngValue]="f.id">{{ f.className }} - {{ f.feeType }} (\${{ f.amount }})</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" [(ngModel)]="paymentForm.amountPaid" name="amountPaid" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select [(ngModel)]="paymentForm.paymentMethod" name="paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input type="text" [(ngModel)]="paymentForm.transactionId" name="transactionId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                <i class="pi pi-check mr-2"></i>Record Payment
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class FeesComponent implements OnInit {
  activeTab = 'structures';
  feeStructures: FeeStructure[] = [];
  payments: FeePayment[] = [];
  students: Student[] = [];
  showStructureForm = false;
  structureForm: any = { feeType: 'Tuition' };
  paymentForm: any = { paymentMethod: 'Cash' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStructures();
    this.loadPayments();
    this.apiService.getStudents().subscribe(s => this.students = s);
  }

  loadStructures(): void { this.apiService.getFeeStructures().subscribe(f => this.feeStructures = f); }
  loadPayments(): void { this.apiService.getFeePayments().subscribe(p => this.payments = p); }

  saveStructure(): void {
    this.apiService.createFeeStructure(this.structureForm).subscribe(() => {
      this.loadStructures();
      this.showStructureForm = false;
      this.structureForm = { feeType: 'Tuition' };
    });
  }

  deleteStructure(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteFeeStructure(id).subscribe(() => this.loadStructures());
  }

  recordPayment(): void {
    this.apiService.createFeePayment(this.paymentForm).subscribe(() => {
      this.loadPayments();
      this.paymentForm = { paymentMethod: 'Cash' };
      this.activeTab = 'payments';
    });
  }
}
