import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../core/services/resume.service';
import { Resume } from '../../core/models/resume.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-resumes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="page-title">My Resumes</h1>
        <p class="page-sub">Upload and manage your resumes for job applications</p>
      </div>

      <!-- Upload Zone -->
      <div class="card mb-6 shadow-md">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-slate-900">Upload Resume</h2>
            <p class="text-xs text-slate-500">PDF, DOC, DOCX — max 5MB</p>
          </div>
        </div>

        <!-- Drop area -->
        <div class="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer"
          [class.border-indigo-400]="isDragging()"
          [class.bg-indigo-50]="isDragging()"
          [class.border-slate-200]="!isDragging()"
          [class.bg-slate-50]="!isDragging()"
          (click)="fileInput.click()"
          (dragover)="$event.preventDefault(); isDragging.set(true)"
          (dragleave)="isDragging.set(false)"
          (drop)="onDrop($event)">

          @if (selectedFile()) {
            <div class="flex flex-col items-center gap-3 fade-in" (click)="$event.stopPropagation()">
              <div class="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-slate-800">{{ selectedFile()!.name }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ (selectedFile()!.size / 1024).toFixed(1) }} KB</p>
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="upload()" class="btn-primary" [disabled]="uploading()">
                  @if (uploading()) {
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Uploading…
                  } @else {
                    Upload Resume
                  }
                </button>
                <button type="button" (click)="clearFile(); $event.stopPropagation()" class="btn-ghost">
                  Remove
                </button>
              </div>
            </div>
          } @else {
            <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p class="font-semibold text-slate-700 mb-1">Drag & drop your resume here</p>
            <p class="text-sm text-slate-400">or <span class="text-indigo-600 font-semibold">click to browse</span></p>
          }
        </div>

        <input #fileInput type="file" accept=".pdf,.doc,.docx" class="hidden" (change)="onFileSelect($event)"/>
      </div>

      <!-- Resume list -->
      <div class="card shadow-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-bold text-slate-900">Uploaded Resumes</h2>
          @if (!loading()) {
            <span class="text-sm text-slate-500">{{ resumes().length }} file{{ resumes().length !== 1 ? 's' : '' }}</span>
          }
        </div>

        @if (loading()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="flex items-center gap-3 p-3 rounded-xl">
                <div class="w-10 h-10 rounded-xl shimmer shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3.5 shimmer rounded w-1/2"></div>
                  <div class="h-3 shimmer rounded w-1/4"></div>
                </div>
              </div>
            }
          </div>
        }

        @if (!loading() && resumes().length === 0) {
          <div class="text-center py-10">
            <div class="text-5xl mb-3">📂</div>
            <p class="font-semibold text-slate-700">No resumes uploaded yet</p>
            <p class="text-slate-400 text-sm mt-1">Upload your first resume above</p>
          </div>
        }

        @if (!loading() && resumes().length > 0) {
          <div class="space-y-2 stagger">
            @for (resume of resumes(); track resume.id) {
              <div class="fade-in flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                <div class="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate text-sm">{{ getFileName(resume.fileUrl) }}</p>
                  <p class="text-xs text-slate-400 font-mono mt-0.5">{{ resume.id.slice(0, 12) }}…</p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="btn-ghost text-xs py-1.5"
                    [disabled]="downloadingId() === resume.id"
                    (click)="download(resume)">
                    {{ downloadingId() === resume.id ? 'Downloading...' : 'Download' }}
                  </button>
                  <span class="badge-open shrink-0">Active</span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ResumesComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private toast = inject(ToastService);

  resumes = signal<Resume[]>([]);
  loading = signal(true);
  uploading = signal(false);
  downloadingId = signal('');
  selectedFile = signal<File | null>(null);
  isDragging = signal(false);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.resumeService.getMyResumes().subscribe({
      next: r => { this.resumes.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  clearFile() { this.selectedFile.set(null); }

  upload() {
    if (!this.selectedFile()) return;
    this.uploading.set(true);
    this.resumeService.upload(this.selectedFile()!).subscribe({
      next: resume => {
        this.resumes.set([resume]);
        this.selectedFile.set(null);
        this.uploading.set(false);
        this.toast.success('Resume uploaded successfully!');
      },
      error: err => {
        this.uploading.set(false);
        this.toast.error(err.error || 'Upload failed. Please try again.');
      }
    });
  }

  download(resume: Resume) {
    this.downloadingId.set(resume.id);
    this.resumeService.downloadMyResume(resume.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getFileName(resume.fileUrl) || 'resume';
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId.set('');
      },
      error: () => {
        this.downloadingId.set('');
        this.toast.error('Failed to download resume');
      }
    });
  }

  getFileName(url: string) { return url?.split(/[\\/]/).pop() ?? url; }
}
