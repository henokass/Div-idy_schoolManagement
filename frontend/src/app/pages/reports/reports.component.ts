import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      @if (loading) {
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">Total Students</p>
            <p class="text-3xl font-bold text-gray-800">{{overview?.totalStudents || 0}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Total Teachers</p>
            <p class="text-3xl font-bold text-gray-800">{{overview?.totalTeachers || 0}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <p class="text-sm text-gray-500">Total Classes</p>
            <p class="text-3xl font-bold text-gray-800">{{overview?.totalClasses || 0}}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
            <p class="text-sm text-gray-500">Total Subjects</p>
            <p class="text-3xl font-bold text-gray-800">{{overview?.totalSubjects || 0}}</p>
          </div>
        </div>

        <!-- Class Distribution -->
        @if (overview?.classDistribution) {
          <div class="bg-white rounded-xl shadow p-6 mb-8">
            <h3 class="text-lg font-semibold mb-4">Class Distribution</h3>
            <div class="space-y-4">
              @for (cls of overview.classDistribution; track cls.name) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium">{{cls.name}} {{cls.section}}</span>
                    <span class="text-gray-500">{{cls.students}} students</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-indigo-600 h-3 rounded-full transition-all" [style.width.%]="maxStudents > 0 ? (cls.students / maxStudents * 100) : 0"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Financial Report -->
        @if (feesReport) {
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Financial Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-gray-500">Total Expected</p>
                <p class="text-xl font-bold text-blue-700">{{feesReport.totalExpected | number:'1.2-2'}} Birr</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-sm text-gray-500">Total Collected</p>
                <p class="text-xl font-bold text-green-700">{{feesReport.totalCollected | number:'1.2-2'}} Birr</p>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <p class="text-sm text-gray-500">Outstanding</p>
                <p class="text-xl font-bold text-red-700">{{feesReport.outstanding | number:'1.2-2'}} Birr</p>
              </div>
            </div>
            @if (feesReport.collectionRate !== undefined) {
              <div class="mt-4">
                <div class="flex justify-between text-sm mb-1">
                  <span>Collection Rate</span>
                  <span class="font-medium">{{feesReport.collectionRate}}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-green-500 h-3 rounded-full" [style.width.%]="feesReport.collectionRate"></div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class ReportsComponent implements OnInit {
  overview: any = null;
  feesReport: any = null;
  loading = true;
  maxStudents = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getOverviewReport().subscribe({
      next: (res) => {
        this.overview = res;
        if (res.classDistribution) {
          this.maxStudents = Math.max(...res.classDistribution.map((c: any) => c.students), 1);
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
    this.api.getFeesReport().subscribe({ next: (res) => this.feesReport = res });
  }
}
