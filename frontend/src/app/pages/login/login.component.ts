import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Golden Academy</h1>
          <p class="text-gray-500 mt-2">School Management System</p>
        </div>
        @if (error) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{{error}}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" [(ngModel)]="username" name="username" required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   placeholder="Enter username">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   placeholder="Enter password">
          </div>
          <button type="submit" [disabled]="loading"
                  class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">
            {{loading ? 'Signing in...' : 'Sign In'}}
          </button>
        </form>
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500 font-medium mb-2">Demo Accounts:</p>
          <div class="grid grid-cols-2 gap-1 text-xs text-gray-600">
            <span>admin / admin123</span>
            <span>teacher1 / teacher123</span>
            <span>student1 / student123</span>
            <span>parent1 / parent123</span>
            <span>accountant1 / accountant123</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isAuthenticated) this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: () => { this.error = 'Invalid username or password'; this.loading = false; }
    });
  }
}
