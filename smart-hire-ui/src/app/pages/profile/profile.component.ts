import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Your account details and information</p>
      </div>

      @if (loading()) {
        <div class="card animate-pulse space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-slate-200"></div>
            <div class="space-y-2">
              <div class="h-5 bg-slate-200 rounded w-40"></div>
              <div class="h-3 bg-slate-100 rounded w-32"></div>
            </div>
          </div>
        </div>
      } @else if (user()) {
        <!-- Profile Header Card -->
        <div class="card mb-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span class="text-2xl font-bold text-white">
                  {{ user()!.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white"
                [class]="user()!.role === 'recruiter' ? 'bg-purple-500' : 'bg-emerald-500'">
              </div>
            </div>

            <div class="flex-1 text-center sm:text-left">
              <h2 class="text-xl font-bold text-slate-900">{{ user()!.name }}</h2>
              <p class="text-slate-500 text-sm">{{ user()!.email }}</p>
              <span class="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize"
                [class]="user()!.role === 'recruiter' ? 'bg-purple-100 text-purple-700' : user()!.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                {{ getRoleIcon(user()!.role) }} {{ user()!.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="card mb-6">
          <h2 class="font-semibold text-slate-800 mb-4">Account Information</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span class="text-sm text-slate-500">Full Name</span>
              </div>
              <span class="text-sm font-medium text-slate-800">{{ user()!.name }}</span>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="text-sm text-slate-500">Email</span>
              </div>
              <span class="text-sm font-medium text-slate-800">{{ user()!.email }}</span>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                <span class="text-sm text-slate-500">Role</span>
              </div>
              <span class="text-sm font-medium text-slate-800 capitalize">{{ user()!.role }}</span>
            </div>

            <div class="flex items-center justify-between py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                  </svg>
                </div>
                <span class="text-sm text-slate-500">User ID</span>
              </div>
              <span class="text-xs font-mono text-slate-500">{{ user()!.id.slice(0, 16) }}...</span>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="card">
          <h2 class="font-semibold text-slate-800 mb-4">Quick Links</h2>
          <div class="grid grid-cols-2 gap-3">
            @if (auth.isCandidate()) {
              <a routerLink="/applications" class="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-700">My Applications</span>
              </a>
              <a routerLink="/resumes" class="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-700">Resumes</span>
              </a>
            }
            @if (auth.isRecruiter()) {
              <a routerLink="/jobs/create" class="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-700">Post Job</span>
              </a>
              <a routerLink="/manage-applications" class="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-700">Applications</span>
              </a>
            }
            <button (click)="auth.logout()"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left">
              <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private userService = inject(UserService);

  user = signal<User | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: user => { this.user.set(user); this.loading.set(false); },
      error: () => {
        this.user.set(this.auth.currentUser());
        this.loading.set(false);
      }
    });
  }

  getRoleIcon(role: string) {
    if (role === 'recruiter') return '🏢';
    if (role === 'admin') return '⚡';
    return '🎯';
  }
}
