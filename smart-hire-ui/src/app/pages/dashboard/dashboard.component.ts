import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap fade-in">

      <!-- ── Hero Banner ─────────────────────────────────────────── -->
      <div class="relative overflow-hidden rounded-3xl mb-8 text-white"
        style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)">

        <!-- Decorative blobs -->
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style="background:white;filter:blur(40px)"></div>
        <div class="absolute -bottom-16 left-10 w-60 h-60 rounded-full opacity-10"
          style="background:white;filter:blur(30px)"></div>

        <!-- Dot grid -->
        <div class="absolute inset-0 opacity-5"
          style="background-image:radial-gradient(circle,white 1px,transparent 1px);background-size:24px 24px"></div>

        <div class="relative z-10 p-8 sm:p-10">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p class="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Welcome back
              </p>
              <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
                {{ auth.currentUser()?.name || 'Guest' }}
              </h1>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style="background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2)">
                  {{ auth.currentUser()?.role || 'visitor' }}
                </span>
              </div>
            </div>

            <!-- CTA buttons -->
            <div class="flex flex-wrap gap-3">
              @if (auth.isCandidate()) {
                <a routerLink="/jobs"
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Browse Jobs
                </a>
                <a routerLink="/resumes"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all text-white"
                  style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3)">
                  Upload Resume
                </a>
              }
              @if (auth.isRecruiter()) {
                <a routerLink="/jobs/create"
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Post New Job
                </a>
                <a routerLink="/manage-applications"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all text-white"
                  style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3)">
                  Manage Applications
                </a>
              }
              @if (!auth.isLoggedIn()) {
                <a routerLink="/register"
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg">
                  Get Started Free
                </a>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stats ────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger">

        <div class="card-hover fade-in group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Live</span>
          </div>
          <div class="text-3xl font-black text-slate-900 tabular-nums">{{ jobCount() }}</div>
          <div class="text-sm text-slate-500 mt-1 font-medium">Open Positions</div>
          <div class="mt-3 h-1 rounded-full bg-slate-100">
            <div class="h-1 rounded-full bg-indigo-400" [style.width]="(jobCount() > 0 ? 70 : 0) + '%'"
              style="transition:width 1s ease"></div>
          </div>
        </div>

        @if (auth.isCandidate()) {
          <div class="card-hover fade-in group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <div class="text-3xl font-black text-slate-900 tabular-nums">{{ applicationCount() }}</div>
            <div class="text-sm text-slate-500 mt-1 font-medium">Applications Sent</div>
            <div class="mt-3 h-1 rounded-full bg-slate-100">
              <div class="h-1 rounded-full bg-emerald-400" [style.width]="(applicationCount() > 0 ? 60 : 0) + '%'"
                style="transition:width 1s ease 0.2s"></div>
            </div>
          </div>
        }

        @if (auth.isRecruiter()) {
          <div class="card-hover fade-in group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Pending</span>
            </div>
            <div class="text-3xl font-black text-slate-900 tabular-nums">{{ applicationCount() }}</div>
            <div class="text-sm text-slate-500 mt-1 font-medium">Candidates to Review</div>
            <div class="mt-3 h-1 rounded-full bg-slate-100">
              <div class="h-1 rounded-full bg-purple-400" [style.width]="(applicationCount() > 0 ? 50 : 0) + '%'"
                style="transition:width 1s ease 0.2s"></div>
            </div>
          </div>
        }

        <div class="card-hover fade-in group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div class="text-3xl font-black text-slate-900">100<span class="text-lg font-semibold text-slate-400">%</span></div>
          <div class="text-sm text-slate-500 mt-1 font-medium">Platform Uptime</div>
          <div class="mt-3 h-1 rounded-full bg-slate-100">
            <div class="h-1 rounded-full bg-amber-400 w-full" style="transition:width 1s ease 0.4s"></div>
          </div>
        </div>

        <div class="card-hover fade-in group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Growing</span>
          </div>
          <div class="text-3xl font-black text-slate-900">AI</div>
          <div class="text-sm text-slate-500 mt-1 font-medium">Resume Scoring</div>
          <div class="mt-3 h-1 rounded-full bg-slate-100">
            <div class="h-1 rounded-full bg-rose-400 w-4/5" style="transition:width 1s ease 0.6s"></div>
          </div>
        </div>
      </div>

      <!-- ── Quick Actions ─────────────────────────────────────────── -->
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">Quick Actions</h2>
        @if (auth.isLoggedIn()) {
          <a routerLink="/profile" class="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 transition-colors">
            View Profile
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        }
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        @for (action of quickActions(); track action.label) {
          <a [routerLink]="action.link"
            class="card-hover fade-in flex flex-col items-center text-center p-5 group cursor-pointer">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-3xl shadow-sm"
              [style.background]="action.bgColor">
              {{ action.icon }}
            </div>
            <span class="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{{ action.label }}</span>
            <span class="text-xs text-slate-400 mt-0.5">{{ action.desc }}</span>
          </a>
        }
      </div>

      <!-- ── Recent jobs preview (public) ─────────────────────────── -->
      @if (recentJobs().length > 0) {
        <div class="mt-10">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-slate-900">Latest Openings</h2>
            <a routerLink="/jobs" class="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 transition-colors">
              See all
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            @for (job of recentJobs(); track job.id) {
              <a [routerLink]="['/jobs', job.id]"
                class="card-hover fade-in flex items-start gap-4 cursor-pointer group">
                <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors truncate">{{ job.title }}</h3>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ job.description }}</p>
                  @if (job.skillsRequired?.length) {
                    <div class="flex gap-1 mt-2 flex-wrap">
                      @for (s of job.skillsRequired.slice(0,3); track s) {
                        <span class="px-1.5 py-0.5 rounded text-xs bg-indigo-50 text-indigo-600 font-medium">{{ s }}</span>
                      }
                    </div>
                  }
                </div>
              </a>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);

  jobCount = signal(0);
  applicationCount = signal(0);
  recentJobs = signal<any[]>([]);
  quickActions = signal<any[]>([]);

  private appsEffect = effect(() => {
    if (this.auth.isLoggedIn()) {
      this.appService.getMyApplications()
        .subscribe(apps => this.applicationCount.set(apps.length));
    }
  });

  ngOnInit() {
    this.jobService.getAll().subscribe(jobs => {
      this.jobCount.set(jobs.length);
      this.recentJobs.set(jobs.slice(0, 3));
    });

    if (this.auth.isLoggedIn()) {
      this.appService.getMyApplications().subscribe(apps => this.applicationCount.set(apps.length));
    }

    if (this.auth.isCandidate()) {
      this.quickActions.set([
        { label: 'Browse Jobs',      desc: 'Find your next role',   icon: '🔍', link: '/jobs',         bgColor: '#eef2ff' },
        { label: 'My Applications',  desc: 'Track your progress',   icon: '📋', link: '/applications', bgColor: '#f0fdf4' },
        { label: 'Upload Resume',    desc: 'Add your latest CV',    icon: '📄', link: '/resumes',      bgColor: '#fef3c7' },
        { label: 'My Profile',       desc: 'Manage your account',   icon: '👤', link: '/profile',      bgColor: '#fdf4ff' },
      ]);
    } else if (this.auth.isRecruiter()) {
      this.quickActions.set([
        { label: 'Post a Job',       desc: 'Create a listing',       icon: '➕', link: '/jobs/create',          bgColor: '#eef2ff' },
        { label: 'Browse Jobs',      desc: 'See all listings',       icon: '🔍', link: '/jobs',                 bgColor: '#f0fdf4' },
        { label: 'Applications',     desc: 'Review candidates',      icon: '👥', link: '/manage-applications',  bgColor: '#fef3c7' },
        { label: 'My Profile',       desc: 'Manage your account',    icon: '👤', link: '/profile',              bgColor: '#fdf4ff' },
      ]);
    } else {
      this.quickActions.set([
        { label: 'Browse Jobs', desc: 'Explore open positions', icon: '🔍', link: '/jobs',     bgColor: '#eef2ff' },
        { label: 'Sign In',     desc: 'Access your account',   icon: '🔑', link: '/login',    bgColor: '#fef3c7' },
        { label: 'Register',    desc: 'Create free account',   icon: '✨', link: '/register', bgColor: '#f0fdf4' },
      ]);
    }
  }
}
