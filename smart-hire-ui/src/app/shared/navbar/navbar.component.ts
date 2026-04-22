import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white/95 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2.5 group shrink-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:scale-105"
              style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-lg font-black text-slate-900 tracking-tight">SmartHire</span>
          </a>

          <!-- Desktop nav links -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/jobs" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Browse Jobs
            </a>

            @if (auth.isCandidate()) {
              <a routerLink="/applications" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Applications
              </a>
              <a routerLink="/resumes" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Resumes
              </a>
            }

            @if (auth.isRecruiter()) {
              <a routerLink="/jobs/create" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Post Job
              </a>
              <a routerLink="/manage-applications" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Candidates
              </a>
            }
          </div>

          <!-- Right: User menu or auth buttons -->
          <div class="flex items-center gap-2">
            @if (auth.isLoggedIn()) {
              <!-- User dropdown -->
              <div class="relative">
                <button (click)="menuOpen.set(!menuOpen())"
                  class="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl hover:bg-slate-100 transition-all border-0 bg-transparent cursor-pointer">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                    {{ auth.currentUser()?.name?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div class="hidden sm:block text-left">
                    <p class="text-sm font-bold text-slate-800 leading-none">{{ auth.currentUser()?.name }}</p>
                    <p class="text-xs text-slate-400 capitalize mt-0.5">{{ auth.currentUser()?.role }}</p>
                  </div>
                  <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="menuOpen()"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (menuOpen()) {
                  <!-- Backdrop -->
                  <div class="fixed inset-0 z-40" (click)="menuOpen.set(false)"></div>
                  <!-- Dropdown -->
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 scale-in"
                    (click)="menuOpen.set(false)">
                    <div class="px-4 py-3 border-b border-slate-100 mb-1">
                      <p class="text-sm font-bold text-slate-900 truncate">{{ auth.currentUser()?.name }}</p>
                      <p class="text-xs text-slate-400 capitalize">{{ auth.currentUser()?.role }}</p>
                    </div>
                    <a routerLink="/dashboard"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      Dashboard
                    </a>
                    <a routerLink="/profile"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      My Profile
                    </a>
                    <div class="border-t border-slate-100 my-1 mx-2"></div>
                    <button (click)="auth.logout()"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors bg-transparent border-0 cursor-pointer text-left rounded-b-xl">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="btn-ghost text-sm py-1.5 px-3">Sign in</a>
              <a routerLink="/register" class="btn-primary text-sm !py-2 !px-4">Get started</a>
            }

            <!-- Mobile hamburger -->
            <button class="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer ml-1"
              (click)="mobileOpen.set(!mobileOpen())">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="md:hidden border-t border-slate-100 bg-white fade-down" (click)="mobileOpen.set(false)">
          <div class="px-4 py-3 space-y-1">
            <a routerLink="/jobs" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              Browse Jobs
            </a>
            @if (auth.isCandidate()) {
              <a routerLink="/applications" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">My Applications</a>
              <a routerLink="/resumes" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Resumes</a>
            }
            @if (auth.isRecruiter()) {
              <a routerLink="/jobs/create" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Post a Job</a>
              <a routerLink="/manage-applications" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Manage Candidates</a>
            }
            @if (auth.isLoggedIn()) {
              <a routerLink="/profile" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">My Profile</a>
              <button (click)="auth.logout()" class="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 bg-transparent border-0 cursor-pointer">
                Sign Out
              </button>
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuOpen  = signal(false);
  mobileOpen = signal(false);
}
