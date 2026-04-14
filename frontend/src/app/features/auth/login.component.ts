import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-building text-3xl text-golden-600"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Golden Academy</h1>
          <p class="text-gray-500 mt-1">School Management System</p>
        </div>

        @if (error) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error }}
          </div>
        }

        <form (ngSubmit)="onLogin()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div class="relative">
              <i class="pi pi-user absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                [(ngModel)]="username"
                name="username"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Enter username"
                required>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <i class="pi pi-lock absolute left-3 top-3 text-gray-400"></i>
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Enter password"
                required>
              <button type="button" (click)="showPassword = !showPassword" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            @if (loading) {
              <i class="pi pi-spinner pi-spin mr-2"></i>
            }
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          <p>Default credentials: <strong>admin</strong> / <strong>Admin&#64;123</strong></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {
    if (authService.isLoggedIn) {
      router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
