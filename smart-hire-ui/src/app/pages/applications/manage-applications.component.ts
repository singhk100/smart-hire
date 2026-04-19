import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { Application, APPLICATION_STATUSES, CandidateProfile } from '../../core/models/application.model';
import { ResumeService } from '../../core/services/resume.service';
import { ToastService } from '../../core/services/toast.service';

const STATUS_STYLE: Record<string, string> = {
  pending:  'badge-pending',
  reviewed: 'badge-reviewed',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
};

@Component({
  selector: 'app-manage-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 class="page-title">Manage Applications</h1>
          <p class="page-sub">Review candidates and update their application status</p>
        </div>
        @if (!loading() && applications().length > 0) {
          <div class="flex items-center gap-2 text-sm">
            <span class="text-slate-500">Total:</span>
            <span class="font-bold text-indigo-700 text-base">{{ applications().length }}</span>
          </div>
        }
      </div>

      <!-- Stats strip -->
      @if (!loading() && applications().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          @for (s of stats(); track s.key) {
            <div class="card py-4 text-center" [class]="'border-l-4 ' + s.border">
              <div class="text-2xl font-black" [class]="s.text">{{ s.count }}</div>
              <div class="text-xs font-semibold text-slate-500 mt-0.5">{{ s.label }}</div>
            </div>
          }
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl shimmer shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 shimmer rounded w-1/3"></div>
                <div class="h-3 shimmer rounded w-1/4"></div>
              </div>
              <div class="w-24 h-7 shimmer rounded-full"></div>
              <div class="w-28 h-9 shimmer rounded-xl"></div>
            </div>
          }
        </div>
      }

      <!-- Empty -->
      @if (!loading() && applications().length === 0) {
        <div class="text-center py-20 fade-in">
          <div class="text-6xl mb-4">👥</div>
          <h3 class="text-lg font-bold text-slate-800">No applications yet</h3>
          <p class="text-slate-500 text-sm mt-1">Candidates will show up here once they apply</p>
        </div>
      }

      <!-- Table -->
      @if (!loading() && applications().length > 0) {
        <div class="card overflow-hidden p-0 shadow-md">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100" style="background:#f8fafc">
                  <th class="text-left px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Candidate</th>
                  <th class="text-left px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Job</th>
                  <th class="text-center px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">AI Score</th>
                  <th class="text-left px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th class="text-left px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (app of applications(); track app.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors group">

                    <!-- Candidate -->
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-indigo-700"
                          style="background:linear-gradient(135deg,#eef2ff,#ede9fe)">
                          {{ (app.candidateName || app.id).slice(0, 2).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-semibold text-slate-800 text-xs">{{ app.candidateName || 'Candidate' }}</p>
                          <p class="text-xs text-slate-400">{{ app.candidateEmail || '—' }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Job -->
                    <td class="px-5 py-4">
                      <p class="font-semibold text-slate-800">{{ app.jobTitle || '—' }}</p>
                    </td>

                    <!-- Score -->
                    <td class="px-5 py-4 text-center">
                      @if (app.score > 0) {
                        <div class="inline-flex flex-col items-center">
                          <div class="relative w-11 h-11">
                            <svg class="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                              <circle cx="18" cy="18" r="14" fill="none"
                                [attr.stroke]="scoreColor(app.score)"
                                stroke-width="4"
                                [attr.stroke-dasharray]="(app.score * 87.96 / 100).toFixed(1) + ' 87.96'"
                                stroke-linecap="round"/>
                            </svg>
                            <span class="absolute inset-0 flex items-center justify-center text-xs font-black"
                              [style.color]="scoreColor(app.score)">{{ app.score }}</span>
                          </div>
                        </div>
                      } @else {
                        <span class="text-slate-300 text-lg">—</span>
                      }
                    </td>

                    <!-- Status badge -->
                    <td class="px-5 py-4">
                      <span [class]="statusClass(app.status)">
                        <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" [class]="dotClass(app.status)"></span>
                        {{ app.status || 'Pending' }}
                      </span>
                    </td>

                    <!-- Action -->
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          class="btn-ghost text-xs py-1.5"
                          (click)="viewCandidate(app)">
                          Profile
                        </button>
                        <button
                          type="button"
                          class="btn-ghost text-xs py-1.5"
                          [disabled]="!app.resumeId || downloadingResumeId() === app.id"
                          (click)="downloadResume(app)">
                          {{ downloadingResumeId() === app.id ? 'Downloading...' : 'Resume' }}
                        </button>
                        <select [(ngModel)]="statusUpdates[app.id]" class="form-input py-1.5 text-xs w-32 shrink-0">
                          @for (s of statuses; track s) {
                            <option [value]="s">{{ s }}</option>
                          }
                        </select>
                        <button (click)="updateStatus(app)"
                          [disabled]="updating() === app.id"
                          class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0">
                          @if (updating() === app.id) {
                            <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          } @else {
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                            </svg>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (profileLoading()) {
        <div class="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div class="card w-full max-w-md text-center">
            <p class="text-slate-600 text-sm">Loading candidate profile...</p>
          </div>
        </div>
      }

      @if (selectedCandidate(); as c) {
        <div class="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" (click)="closeCandidate()">
          <div class="card w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-slate-900">Candidate Profile</h3>
              <button type="button" class="btn-ghost py-1.5 px-2 text-xs" (click)="closeCandidate()">Close</button>
            </div>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-slate-500 text-xs">Name</p>
                <p class="font-semibold text-slate-900">{{ c.name }}</p>
              </div>
              <div>
                <p class="text-slate-500 text-xs">Email</p>
                <p class="font-semibold text-slate-900">{{ c.email }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ManageApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private resumeService = inject(ResumeService);
  private toast = inject(ToastService);

  applications = signal<Application[]>([]);
  loading = signal(true);
  updating = signal('');
  statuses = APPLICATION_STATUSES;
  statusUpdates: Record<string, string> = {};
  selectedCandidate = signal<CandidateProfile | null>(null);
  profileLoading = signal(false);
  downloadingResumeId = signal('');

  stats = computed(() => {
    const apps = this.applications();
    return [
      { key: 'pending',  label: 'Pending',  count: apps.filter(a => (a.status || 'pending').toLowerCase() === 'pending').length,  text: 'text-amber-600',  border: 'border-amber-400' },
      { key: 'reviewed', label: 'Reviewed', count: apps.filter(a => (a.status || '').toLowerCase() === 'reviewed').length, text: 'text-blue-600',   border: 'border-blue-400' },
      { key: 'accepted', label: 'Accepted', count: apps.filter(a => (a.status || '').toLowerCase() === 'accepted').length, text: 'text-emerald-600', border: 'border-emerald-400' },
      { key: 'rejected', label: 'Rejected', count: apps.filter(a => (a.status || '').toLowerCase() === 'rejected').length, text: 'text-red-600',    border: 'border-red-400' },
    ];
  });

  ngOnInit() {
    this.appService.getRecruiterApplications().subscribe({
      next: apps => {
        this.applications.set(apps);
        apps.forEach(a => this.statusUpdates[a.id] = a.status || 'Pending');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(app: Application) {
    const newStatus = this.statusUpdates[app.id].toLowerCase();
    if (!newStatus) return;
    this.updating.set(app.id);
    this.appService.updateStatus({ applicationId: app.id, status: newStatus }).subscribe({
      next: () => {
        this.applications.update(apps => apps.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
        this.updating.set('');
        this.toast.success(`Status updated to "${newStatus}"`);
      },
      error: () => {
        this.updating.set('');
        this.toast.error('Failed to update status');
      }
    });
  }

  viewCandidate(app: Application) {
    if (!app.candidateId) return;
    this.profileLoading.set(true);
    this.selectedCandidate.set(null);
    this.appService.getCandidateProfile(app.candidateId).subscribe({
      next: candidate => {
        this.selectedCandidate.set(candidate);
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileLoading.set(false);
        this.toast.error('Failed to load candidate profile');
      }
    });
  }

  closeCandidate() {
    this.selectedCandidate.set(null);
  }

  downloadResume(app: Application) {
    if (!app.resumeId) return;
    this.downloadingResumeId.set(app.id);
    this.resumeService.downloadCandidateResume(app.resumeId).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(app.candidateName || 'candidate').split(' ').join('_')}-resume`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingResumeId.set('');
      },
      error: () => {
        this.downloadingResumeId.set('');
        this.toast.error('Failed to download resume');
      }
    });
  }

  statusClass(s: string) { return STATUS_STYLE[(s || 'pending').toLowerCase()] ?? 'badge-pending'; }
  dotClass(s: string) {
    const m: Record<string, string> = { pending: 'bg-amber-400', reviewed: 'bg-blue-400', accepted: 'bg-emerald-500', rejected: 'bg-red-500' };
    return m[(s || 'pending').toLowerCase()] ?? 'bg-amber-400';
  }
  scoreColor(n: number) { return n >= 75 ? '#10b981' : n >= 50 ? '#f59e0b' : '#ef4444'; }
}
