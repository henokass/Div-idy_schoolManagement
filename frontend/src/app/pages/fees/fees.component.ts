import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Fee Management</h1>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p class="text-sm text-gray-500">Total Collected</p>
          <p class="text-2xl font-bold">{{totalCollected | number:'1.2-2'}} Birr</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p class="text-sm text-gray-500">Fee Structures</p>
          <p class="text-2xl font-bold">{{structures.length}}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <p class="text-sm text-gray-500">Payments</p>
          <p class="text-2xl font-bold">{{payments.length}}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button (click)="activeTab = 'structures'" [class]="activeTab === 'structures' ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg' : 'px-4 py-2 bg-white border rounded-lg'">Fee Structures</button>
        <button (click)="activeTab = 'payments'" [class]="activeTab === 'payments' ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg' : 'px-4 py-2 bg-white border rounded-lg'">Payments</button>
      </div>

      @if (activeTab === 'structures') {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <div class="p-4 border-b flex justify-end">
            <button (click)="showAddStructure = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Fee Structure</button>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Class</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Term</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Due Date</th>
              </tr>
            </thead>
            <tbody>
              @for (s of structures; track s.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{s.name}}</td>
                  <td class="px-6 py-4">{{s.amount | number:'1.2-2'}} Birr</td>
                  <td class="px-6 py-4">{{s.class.name}} {{s.class.section}}</td>
                  <td class="px-6 py-4">{{s.term}}</td>
                  <td class="px-6 py-4">{{s.dueDate | date:'mediumDate'}}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab === 'payments') {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <div class="p-4 border-b flex justify-end">
            <button (click)="showAddPayment = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Record Payment</button>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Fee</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Amount Paid</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Method</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (p of payments; track p.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{p.student.user.firstName}} {{p.student.user.lastName}}</td>
                  <td class="px-6 py-4">{{p.feeStructure.name}}</td>
                  <td class="px-6 py-4">{{p.amountPaid | number:'1.2-2'}} Birr</td>
                  <td class="px-6 py-4">{{p.paymentMethod || 'N/A'}}</td>
                  <td class="px-6 py-4"><span [class]="'px-2 py-1 rounded text-xs ' + statusColor(p.status)">{{p.status}}</span></td>
                  <td class="px-6 py-4">{{p.paymentDate | date:'mediumDate'}}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showAddStructure) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Add Fee Structure</h2>
            <form (ngSubmit)="addStructure()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Name</label><input [(ngModel)]="newStructure.name" name="name" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Amount</label><input [(ngModel)]="newStructure.amount" name="amount" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Class</label>
                  <select [(ngModel)]="newStructure.classId" name="classId" class="w-full px-3 py-2 border rounded-lg" required>
                    @for (c of classList; track c.id) { <option [ngValue]="c.id">{{c.name}} {{c.section}}</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Term</label>
                  <select [(ngModel)]="newStructure.term" name="term" class="w-full px-3 py-2 border rounded-lg">
                    <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Due Date</label><input [(ngModel)]="newStructure.dueDate" name="dueDate" type="date" class="w-full px-3 py-2 border rounded-lg" required></div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showAddStructure = false" class="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showAddPayment) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Record Payment</h2>
            <form (ngSubmit)="addPayment()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Student</label>
                  <select [(ngModel)]="newPayment.studentId" name="studentId" class="w-full px-3 py-2 border rounded-lg" required>
                    @for (s of studentList; track s.id) { <option [ngValue]="s.id">{{s.user.firstName}} {{s.user.lastName}}</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Fee Structure</label>
                  <select [(ngModel)]="newPayment.feeStructureId" name="feeStructureId" class="w-full px-3 py-2 border rounded-lg" required>
                    @for (f of structures; track f.id) { <option [ngValue]="f.id">{{f.name}} - {{f.class.name}} ({{f.amount}} Birr)</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium mb-1">Amount</label><input [(ngModel)]="newPayment.amountPaid" name="amount" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Payment Method</label><input [(ngModel)]="newPayment.paymentMethod" name="method" class="w-full px-3 py-2 border rounded-lg" placeholder="Cash, Bank Transfer..."></div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showAddPayment = false" class="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class FeesComponent implements OnInit {
  structures: any[] = [];
  payments: any[] = [];
  classList: any[] = [];
  studentList: any[] = [];
  activeTab = 'structures';
  showAddStructure = false;
  showAddPayment = false;
  totalCollected = 0;
  newStructure: any = { term: 'Term 1', academicYear: '2024/2025' };
  newPayment: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getFeeStructures().subscribe({ next: (res) => this.structures = res });
    this.api.getPayments().subscribe({ next: (res) => { this.payments = res; this.totalCollected = res.reduce((sum: number, p: any) => sum + p.amountPaid, 0); } });
    this.api.getClasses().subscribe({ next: (res) => this.classList = res });
    this.api.getStudents().subscribe({ next: (res) => this.studentList = res });
  }

  statusColor(status: string): string {
    if (status === 'PAID') return 'bg-green-100 text-green-800';
    if (status === 'PARTIAL') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  addStructure() { this.api.createFeeStructure(this.newStructure).subscribe({ next: () => { this.showAddStructure = false; this.ngOnInit(); } }); }
  addPayment() { this.api.createPayment(this.newPayment).subscribe({ next: () => { this.showAddPayment = false; this.ngOnInit(); } }); }
}
