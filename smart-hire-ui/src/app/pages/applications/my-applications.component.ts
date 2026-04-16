import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { Application } from '../../core/models/application.model';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; order: number }> = {
  pending:  { label: 'Pending',  color: '#b45309', bg: '#fef3c7', dot: '#f59e0b', order: 1 },
  reviewed: { label: 'Reviewed', color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6', order: 2 },
  accepted: { label: 'Accepted', color: '#065f46', bg: '#d1fae5', dot: '#10b981', order: 3 },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2', dot: '#ef4444', order: 4 },
};

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 class="page-title">My Applications</h1>
          <p class="page-sub">Track every application at a glance</p>
        </div>
        <a routerLink="/jobs" class="btn-primary self-start">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Find More Jobs
        </a>
      </div>

      <!-- Pipeline Status Bar -->
      @if (!loading() && applications().length > 0) {
        <div class="card mb-8">
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Application Pipeline</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            @for (stage of pipeline(); track stage.key) {
              <div class="relative rounded-2xl p-4 text-center transition-all"
                [style.background]="stage.bg">
                <div class="text-2xl font-black mb-1" [style.color]="stage.color">{{ stage.count }}</div>
                <div class="text-xs font-semibold" [style.color]="stage.color">{{ stage.label }}</div>
                <!-- Progress bar -->
                <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" [style.background]="stage.dot + '40'">
                  <div class="h-full rounded-b-2xl transition-all duration-700"
                    [style.background]="stage.dot"
                    [style.width]="(applications().length > 0 ? (stage.count / applications().length) * 100 : 0) + '%'">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="card flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl shimmer shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 shimmer rounded w-1/2"></div>
                <div class="h-3 shimmer rounded w-1/3"></div>
              </div>
              <div class="w-20 h-6 shimmer rounded-full"></div>
            </div>
          }
        </div>
      }

      <!-- Empty -->
      @if (!loading() && applications().length === 0) {
        <div class="text-center py-20 fade-in">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-lg font-bold text-slate-800">No applications yet</h3>
          <p class="text-slate-500 text-sm mt-1 mb-5">Apply to your first job and track it here</p>
          <a routerLink="/jobs" class="btn-primary">Browse Jobs</a>
        </div>
      }

      <!-- Applications List -->
      @if (!loading() && applications().length > 0) {
        <div class="space-y-3 stagger">
          @for (app of applications(); track app.id) {
            <div class="card-hover fade-in flex flex-col sm:flex-row sm:items-center gap-4">

              <!-- Icon with status color -->
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                [style.background]="getStatusConf(app.status).bg">
                <svg class="w-6 h-6" [style.color]="getStatusConf(app.status).dot"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-slate-900 truncate">{{ app.jobTitle || 'Job Application' }}</h3>
                <p class="text-xs text-slate-400 mt-0.5 font-mono">ID: {{ app.id.slice(0, 12) }}…</p>
              </div>

              <!-- AI Score ring -->
              @if (app.score > 0) {
                <div class="flex flex-col items-center shrink-0">
                  <div class="relative w-12 h-12">
                    <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                      <circle cx="18" cy="18" r="14" fill="none"
                        [attr.stroke]="scoreColor(app.score)"
                        stroke-width="4"
                        [attr.stroke-dasharray]="(app.score * 87.96 / 100) + ' 87.96'"
                        stroke-linecap="round"/>
                    </svg>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-black"
                      [style.color]="scoreColor(app.score)">{{ app.score }}</span>
                  </div>
                  <span class="text-xs text-slate-400 mt-0.5">AI Score</span>
                </div>
              }

              <!-- Status badge -->
              <span class="badge shrink-0 text-sm px-3 py-1"
                [style.background]="getStatusConf(app.status).bg"
                [style.color]="getStatusConf(app.status).color">
                <span class="w-1.5 h-1.5 rounded-full inline-block mr-1"
                  [style.background]="getStatusConf(app.status).dot"></span>
                {{ getStatusConf(app.status).label }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);

  applications = signal<Application[]>([]);
  loading = signal(true);

  pipeline = computed(() => {
    const apps = this.applications();
    return Object.entries(STATUS_CONFIG).map(([key, conf]) => ({
      key,
      ...conf,
      count: apps.filter(a => (a.status || 'pending').toLowerCase() === key).length
    }));
  });

  ngOnInit() {
    this.appService.getMyApplications().subscribe({
      next: apps => { this.applications.set(apps); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  getStatusConf(status: string) {
    return STATUS_CONFIG[(status || 'pending').toLowerCase()] ?? STATUS_CONFIG['pending'];
  }

  scoreColor(score: number) {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }
}
