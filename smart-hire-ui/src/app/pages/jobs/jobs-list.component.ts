import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-wrap fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="page-title">Browse Jobs</h1>
          <p class="page-sub">
            @if (!loading()) {
              <span class="font-semibold text-indigo-600">{{ filteredJobs().length }}</span>
              {{ filteredJobs().length === 1 ? 'position' : 'positions' }} available
            } @else {
              Loading jobs...
            }
          </p>
        </div>
        @if (auth.isRecruiter()) {
          <a routerLink="/jobs/create" class="btn-primary self-start">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Post a Job
          </a>
        }
      </div>

      <!-- Search Bar -->
      <div class="relative mb-6">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
          type="text" placeholder="Search by title, description or skill…"
          class="form-input pl-12 pr-4 py-3.5 text-base shadow-sm" />
        @if (searchQuery) {
          <button (click)="clearSearch()"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
      </div>

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-11 h-11 rounded-xl shimmer"></div>
                <div class="w-12 h-5 rounded-full shimmer"></div>
              </div>
              <div class="h-5 shimmer rounded w-3/4"></div>
              <div class="h-3.5 shimmer rounded w-full"></div>
              <div class="h-3.5 shimmer rounded w-5/6"></div>
              <div class="flex gap-2 pt-1">
                <div class="h-5 shimmer rounded-md w-16"></div>
                <div class="h-5 shimmer rounded-md w-20"></div>
              </div>
              <div class="h-9 shimmer rounded-xl mt-2"></div>
            </div>
          }
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="text-center py-20 fade-in">
          <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Could not load jobs</h3>
          <p class="text-slate-500 text-sm mt-1 mb-4">{{ error() }}</p>
          <button (click)="load()" class="btn-primary">Try Again</button>
        </div>
      }

      <!-- Jobs Grid -->
      @if (!loading() && !error()) {
        @if (filteredJobs().length === 0) {
          <div class="text-center py-20 fade-in">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-lg font-bold text-slate-800">No matches found</h3>
            <p class="text-slate-500 text-sm mt-1 mb-4">Try different keywords</p>
            <button (click)="clearSearch()" class="btn-secondary">Clear Search</button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            @for (job of filteredJobs(); track job.id) {
              <div class="card-hover fade-in flex flex-col">

                <!-- Header row -->
                <div class="flex items-start justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="badge-open">● Open</span>
                </div>

                <!-- Title & description -->
                <h3 class="font-bold text-slate-900 text-lg leading-snug mb-2">{{ job.title }}</h3>
                <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{{ job.description }}</p>

                <!-- Skills -->
                @if (job.skillsRequired && job.skillsRequired.length > 0) {
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    @for (skill of job.skillsRequired.slice(0, 4); track skill) {
                      <span class="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                        {{ skill }}
                      </span>
                    }
                    @if (job.skillsRequired.length > 4) {
                      <span class="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                        +{{ job.skillsRequired.length - 4 }}
                      </span>
                    }
                  </div>
                }

                <!-- CTA -->
                <a [routerLink]="['/jobs', job.id]" class="btn-primary w-full mt-auto">
                  View & Apply
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class JobsListComponent implements OnInit {
  auth = inject(AuthService);
  private jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal('');
  searchQuery = '';
  private _searchSignal = signal('');

  filteredJobs = computed(() => {
    const q = this._searchSignal().toLowerCase().trim();
    if (!q) return this.jobs();
    return this.jobs().filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      j.skillsRequired?.some(s => s.toLowerCase().includes(q))
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.jobService.getAll().subscribe({
      next: jobs => { this.jobs.set(jobs); this.loading.set(false); },
      error: err => { this.error.set(err.message || 'Failed to load'); this.loading.set(false); }
    });
  }

  onSearch(val: string) { this._searchSignal.set(val); }
  clearSearch() { this.searchQuery = ''; this._searchSignal.set(''); }
}
