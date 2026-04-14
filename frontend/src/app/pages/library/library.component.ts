import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Library</h1>

      <div class="flex gap-2 mb-6">
        <button (click)="activeTab = 'books'" [class]="activeTab === 'books' ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg' : 'px-4 py-2 bg-white border rounded-lg'">Books</button>
        <button (click)="activeTab = 'issues'; loadIssues()" [class]="activeTab === 'issues' ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg' : 'px-4 py-2 bg-white border rounded-lg'">Issued Books</button>
      </div>

      @if (activeTab === 'books') {
        <div class="flex justify-between items-center mb-4">
          <input type="text" [(ngModel)]="search" placeholder="Search books..." class="px-4 py-2 border rounded-lg w-64">
          <button (click)="showAdd = true" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Book</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (book of filteredBooks; track book.id) {
            <div class="bg-white rounded-xl shadow p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-lg">{{book.title}}</h3>
                  <p class="text-sm text-gray-500">{{book.author}}</p>
                </div>
                <button (click)="deleteBook(book.id)" class="text-red-400 hover:text-red-600"><i class="pi pi-trash"></i></button>
              </div>
              <div class="mt-4 space-y-1 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">ISBN:</span><span>{{book.isbn || 'N/A'}}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Category:</span><span>{{book.category || 'N/A'}}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Total:</span><span>{{book.quantity}}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Available:</span><span class="font-semibold" [class.text-green-600]="book.available > 0" [class.text-red-600]="book.available === 0">{{book.available}}</span></div>
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab === 'issues') {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Book</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Issue Date</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Due Date</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Fine</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (issue of issues; track issue.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{issue.book.title}}</td>
                  <td class="px-6 py-4">{{issue.student.user.firstName}} {{issue.student.user.lastName}}</td>
                  <td class="px-6 py-4">{{issue.issueDate | date:'mediumDate'}}</td>
                  <td class="px-6 py-4">{{issue.dueDate | date:'mediumDate'}}</td>
                  <td class="px-6 py-4">
                    <span [class]="issue.returnDate ? 'px-2 py-1 bg-green-100 text-green-800 rounded text-xs' : 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs'">
                      {{issue.returnDate ? 'Returned' : 'Issued'}}
                    </span>
                  </td>
                  <td class="px-6 py-4">{{issue.fine > 0 ? (issue.fine + ' Birr') : '-'}}</td>
                  <td class="px-6 py-4">
                    @if (!issue.returnDate) {
                      <button (click)="returnBook(issue.id)" class="text-indigo-600 hover:text-indigo-800">Return</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showAdd) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Add Book</h2>
            <form (ngSubmit)="addBook()">
              <div class="space-y-4">
                <div><label class="block text-sm font-medium mb-1">Title</label><input [(ngModel)]="newBook.title" name="title" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">Author</label><input [(ngModel)]="newBook.author" name="author" class="w-full px-3 py-2 border rounded-lg" required></div>
                <div><label class="block text-sm font-medium mb-1">ISBN</label><input [(ngModel)]="newBook.isbn" name="isbn" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium mb-1">Category</label><input [(ngModel)]="newBook.category" name="category" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium mb-1">Quantity</label><input [(ngModel)]="newBook.quantity" name="quantity" type="number" class="w-full px-3 py-2 border rounded-lg" required></div>
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
export class LibraryComponent implements OnInit {
  books: any[] = [];
  issues: any[] = [];
  search = '';
  activeTab = 'books';
  showAdd = false;
  newBook: any = { quantity: 1 };

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getBooks().subscribe({ next: (res) => this.books = res }); }

  get filteredBooks() {
    if (!this.search) return this.books;
    const s = this.search.toLowerCase();
    return this.books.filter(b => `${b.title} ${b.author}`.toLowerCase().includes(s));
  }

  loadIssues() { this.api.getBookIssues().subscribe({ next: (res) => this.issues = res }); }
  addBook() { this.api.createBook(this.newBook).subscribe({ next: () => { this.showAdd = false; this.newBook = { quantity: 1 }; this.ngOnInit(); } }); }
  deleteBook(id: number) { if (confirm('Delete?')) { this.api.deleteBook(id).subscribe({ next: () => this.ngOnInit() }); } }
  returnBook(issueId: number) { this.api.returnBook(issueId).subscribe({ next: () => this.loadIssues() }); }
}
