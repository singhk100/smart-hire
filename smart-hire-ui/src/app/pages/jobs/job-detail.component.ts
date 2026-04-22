import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { ResumeService } from '../../core/services/resume.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Job } from '../../core/models/job.model';
import { Resume } from '../../core/models/resume.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">

      <!-- Back -->
      <a routerLink="/jobs"
        class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 font-medium transition-colors group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        All Jobs
      </a>

      <!-- Loading -->
      @if (loading()) {
        <div class="card space-y-5">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl shimmer"></div>
            <div class="flex-1 space-y-2">
              <div class="h-6 shimmer rounded w-1/2"></div>
              <div class="h-4 shimmer rounded w-1/4"></div>
            </div>
          </div>
          <div class="space-y-2 pt-2">
            <div class="h-3.5 shimmer rounded w-full"></div>
            <div class="h-3.5 shimmer rounded w-5/6"></div>
            <div class="h-3.5 shimmer rounded w-4/6"></div>
          </div>
        </div>
      }

      @if (!loading() && !job()) {
        <div class="text-center py-20 fade-in">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-bold text-slate-800">Job not found</h3>
          <a routerLink="/jobs" class="btn-primary mt-4">Browse Jobs</a>
        </div>
      }

      @if (!loading() && job()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Main content -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Job header card -->
            <div class="card">
              <div class="flex items-start gap-5">
                <div class="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center"
                  style="background:linear-gradient(135deg,#eef2ff,#ede9fe)">
                  <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between gap-4 flex-wrap">
                    <h1 class="text-2xl font-bold text-slate-900 leading-tight">{{ job()!.title }}</h1>
                    <span class="badge-open shrink-0">● Actively Hiring</span>
                  </div>
                  <div class="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Remote / Hybrid
                    </span>
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Full-time
                    </span>
                  </div>
                  @if (canDeleteJob(job()!)) {
                    <button
                      type="button"
                      class="btn-ghost mt-4 text-red-600 border border-red-200 hover:bg-red-50"
                      [disabled]="deleting()"
                      (click)="deleteJob()">
                      {{ deleting() ? 'Deleting...' : 'Delete Job' }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="card">
              <h2 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div class="w-1 h-5 rounded-full bg-indigo-500"></div>
                Job Description
              </h2>
              <p class="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{{ job()!.description }}</p>
            </div>

            <!-- Skills -->
            @if (job()!.skillsRequired && job()!.skillsRequired.length > 0) {
              <div class="card">
                <h2 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div class="w-1 h-5 rounded-full bg-purple-500"></div>
                  Required Skills
                </h2>
                <div class="flex flex-wrap gap-2">
                  @for (skill of job()!.skillsRequired; track skill) {
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                      <svg class="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                      {{ skill }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="card sticky top-24">
              <h2 class="font-bold text-slate-900 text-lg mb-1">Apply Now</h2>
              <p class="text-sm text-slate-500 mb-5">Submit your application for this position</p>

              @if (!auth.isLoggedIn()) {
                <div class="text-center py-4">
                  <div class="text-3xl mb-3">🔒</div>
                  <p class="text-sm text-slate-600 mb-4">Sign in to apply for this role</p>
                  <a routerLink="/login" class="btn-primary w-full">Sign in to Apply</a>
                  <a routerLink="/register" class="btn-ghost w-full mt-2 text-xs">Create free account</a>
                </div>
              }

              @if (auth.isLoggedIn() && !auth.isCandidate()) {
                <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <svg class="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span>Only job seekers can apply. Recruiters can post jobs instead.</span>
                </div>
              }

              @if (auth.isCandidate()) {
                @if (applied()) {
                  <div class="text-center py-6 fade-in">
                    <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p class="font-bold text-emerald-700">Application Submitted!</p>
                    <p class="text-xs text-slate-500 mt-1">We'll notify you of any updates</p>
                    <a routerLink="/applications" class="btn-secondary w-full mt-4 text-sm">Track My Applications</a>
                  </div>
                }

                @if (!applied()) {
                  @if (resumes().length === 0) {
                    <div class="text-center py-4">
                      <div class="text-3xl mb-3">📄</div>
                      <p class="text-sm text-slate-600 mb-4">Upload a resume first to apply</p>
                      <a routerLink="/resumes" class="btn-secondary w-full">Upload Resume</a>
                    </div>
                  } @else {
                    <div class="space-y-4">
                      <div class="form-group">
                        <label class="form-label">Choose Resume</label>
                        <select [(ngModel)]="selectedResumeId" class="form-input">
                          <option value="">Select a resume…</option>
                          @for (r of resumes(); track r.id) {
                            <option [value]="r.id">{{ getFileName(r.fileUrl) }}</option>
                          }
                        </select>
                      </div>

                      @if (applyError()) {
                        <div class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{{ applyError() }}</div>
                      }

                      <button (click)="apply()" class="btn-primary w-full py-3"
                        [disabled]="!selectedResumeId || applying()">
                        @if (applying()) {
                          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Submitting…
                        } @else {
                          Submit Application
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        }
                      </button>

                      <a routerLink="/resumes" class="block text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                        + Manage Resumes
                      </a>
                    </div>
                  }
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  private resumeService = inject(ResumeService);
  private router = inject(Router);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  job = signal<Job | null>(null);
  resumes = signal<Resume[]>([]);
  loading = signal(true);
  applying = signal(false);
  applied = signal(false);
  deleting = signal(false);
  applyError = signal('');
  selectedResumeId = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.jobService.getAll().subscribe(jobs => {
      this.job.set(jobs.find(j => j.id === id) ?? null);
      this.loading.set(false);
    });

    if (this.auth.isCandidate()) {
      this.resumeService.getMyResumes().subscribe(r => this.resumes.set(r));
    }
  }

  apply() {
    if (!this.selectedResumeId) return;
    this.applying.set(true);
    this.applyError.set('');
    this.appService.apply({ jobId: this.job()!.id, resumeId: this.selectedResumeId }).subscribe({
      next: () => {
        this.applied.set(true);
        this.applying.set(false);
        this.toast.success('Application submitted successfully!');
      },
      error: err => {
        const msg = err.error || 'Failed to apply. Please try again.';
        this.applyError.set(msg);
        this.toast.error(msg);
        this.applying.set(false);
      }
    });
  }

  canDeleteJob(job: Job) {
    const currentUserId = this.auth.currentUser()?.id?.toLowerCase();
    const ownerId = job.recruiterId?.toLowerCase();
    return this.auth.isRecruiter() && !!currentUserId && !!ownerId && ownerId === currentUserId;
  }

  deleteJob() {
    const currentJob = this.job();
    if (!currentJob || !this.canDeleteJob(currentJob)) return;

    const ok = window.confirm(`Delete "${currentJob.title}"? This will also remove related applications.`);
    if (!ok) return;

    this.deleting.set(true);
    this.jobService.delete(currentJob.id).subscribe({
      next: () => {
        this.toast.success('Job deleted successfully');
        this.router.navigate(['/jobs']);
      },
      error: () => {
        this.toast.error('Failed to delete job');
        this.deleting.set(false);
      }
    });
  }

  getFileName(url: string) { return url?.split(/[\\/]/).pop() ?? url; }
}
