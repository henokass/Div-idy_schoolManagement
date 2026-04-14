import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LibraryBook, BookIssue, Student } from '../../core/models/models';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Library</h1>
      </div>

      <div class="flex gap-2 mb-6">
        <button (click)="activeTab = 'books'" [class]="activeTab === 'books' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Books</button>
        <button (click)="activeTab = 'issues'" [class]="activeTab === 'issues' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Issued Books</button>
        <button (click)="activeTab = 'issue'" [class]="activeTab === 'issue' ? 'bg-primary-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'">Issue Book</button>
      </div>

      @if (activeTab === 'books') {
        <div class="flex gap-4 mb-4">
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadBooks()" placeholder="Search books..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
          <button (click)="showBookForm = !showBookForm" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            <i class="pi pi-plus mr-2"></i>Add Book
          </button>
        </div>

        @if (showBookForm) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <form (ngSubmit)="saveBook()">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" [(ngModel)]="bookForm.title" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input type="text" [(ngModel)]="bookForm.author" name="author" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input type="text" [(ngModel)]="bookForm.isbn" name="isbn" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" [(ngModel)]="bookForm.category" name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                  <input type="number" [(ngModel)]="bookForm.totalCopies" name="totalCopies" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
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
                <th class="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Author</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">ISBN</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Available</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of books; track b.id) {
                <tr class="border-t border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium">{{ b.title }}</td>
                  <td class="py-3 px-4">{{ b.author }}</td>
                  <td class="py-3 px-4 font-mono text-xs">{{ b.isbn }}</td>
                  <td class="py-3 px-4">{{ b.category }}</td>
                  <td class="py-3 px-4">
                    <span [class]="b.availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                      {{ b.availableCopies }}/{{ b.totalCopies }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button (click)="deleteBook(b.id)" class="text-red-600 hover:text-red-800"><i class="pi pi-trash"></i></button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="py-8 text-center text-gray-500">No books found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab === 'issues') {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Book</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Issue Date</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Return Date</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Fine</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (i of issues; track i.id) {
                <tr class="border-t border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium">{{ i.bookTitle }}</td>
                  <td class="py-3 px-4">{{ i.studentName }}</td>
                  <td class="py-3 px-4">{{ i.issueDate | date:'mediumDate' }}</td>
                  <td class="py-3 px-4">{{ i.dueDate | date:'mediumDate' }}</td>
                  <td class="py-3 px-4">{{ i.returnDate ? (i.returnDate | date:'mediumDate') : 'Not returned' }}</td>
                  <td class="py-3 px-4">\${{ i.fine.toFixed(2) }}</td>
                  <td class="py-3 px-4">
                    @if (!i.returnDate) {
                      <button (click)="returnBook(i.id)" class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs hover:bg-green-200">Return</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="py-8 text-center text-gray-500">No issued books</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab === 'issue') {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold mb-4">Issue a Book</h3>
          <form (ngSubmit)="issueBook()">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select [(ngModel)]="issueForm.bookId" name="bookId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (b of books; track b.id) {
                    <option [ngValue]="b.id" [disabled]="b.availableCopies === 0">{{ b.title }} ({{ b.availableCopies }} available)</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select [(ngModel)]="issueForm.studentId" name="studentId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  @for (s of students; track s.id) { <option [ngValue]="s.id">{{ s.firstName }} {{ s.lastName }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" [(ngModel)]="issueForm.dueDate" name="dueDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">Issue Book</button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class LibraryComponent implements OnInit {
  activeTab = 'books';
  books: LibraryBook[] = [];
  issues: BookIssue[] = [];
  students: Student[] = [];
  searchTerm = '';
  showBookForm = false;
  bookForm: any = {};
  issueForm: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadIssues();
    this.apiService.getStudents().subscribe(s => this.students = s);
  }

  loadBooks(): void { this.apiService.getBooks(this.searchTerm || undefined).subscribe(b => this.books = b); }
  loadIssues(): void { this.apiService.getBookIssues().subscribe(i => this.issues = i); }

  saveBook(): void {
    this.apiService.createBook(this.bookForm).subscribe(() => {
      this.loadBooks();
      this.showBookForm = false;
      this.bookForm = {};
    });
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure?')) this.apiService.deleteBook(id).subscribe(() => this.loadBooks());
  }

  issueBook(): void {
    this.apiService.issueBook(this.issueForm).subscribe(() => {
      this.loadIssues();
      this.loadBooks();
      this.issueForm = {};
      this.activeTab = 'issues';
    });
  }

  returnBook(id: number): void {
    this.apiService.returnBook(id).subscribe(() => {
      this.loadIssues();
      this.loadBooks();
    });
  }
}
