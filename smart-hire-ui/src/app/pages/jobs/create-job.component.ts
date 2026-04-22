import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">

      <!-- Back -->
      <a routerLink="/jobs"
        class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 font-medium transition-colors group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Jobs
      </a>

      <!-- Page header -->
      <div class="mb-8">
        <h1 class="page-title">Post a New Job</h1>
        <p class="page-sub">Fill in the details below to publish your listing</p>
      </div>

      <div class="card shadow-md">

        <!-- Progress indicator -->
        <div class="flex items-center gap-2 mb-8">
          @for (step of steps; track step.n) {
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                [class]="step.n <= currentStep() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'">
                @if (step.n < currentStep()) {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  {{ step.n }}
                }
              </div>
              <span class="text-xs font-medium"
                [class]="step.n <= currentStep() ? 'text-indigo-700' : 'text-slate-400'">{{ step.label }}</span>
            </div>
            @if (step.n < steps.length) {
              <div class="flex-1 h-0.5 rounded-full"
                [class]="step.n < currentStep() ? 'bg-indigo-300' : 'bg-slate-200'"></div>
            }
          }
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">

          @if (error()) {
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm fade-in">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error() }}
            </div>
          }

          <!-- Job Title -->
          <div class="form-group">
            <label class="form-label">
              Job Title <span class="text-red-400">*</span>
            </label>
            <input formControlName="title" type="text" class="form-input"
              placeholder="e.g. Senior Angular Developer" (focus)="currentStep.set(1)"/>
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Job title is required
              </p>
            }
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">
              Job Description <span class="text-red-400">*</span>
            </label>
            <textarea formControlName="description" rows="7" class="form-input resize-none"
              placeholder="Describe the role, responsibilities, requirements, and any benefits…"
              (focus)="currentStep.set(2)"></textarea>
            <div class="flex items-center justify-between mt-1.5">
              @if (form.get('description')?.invalid && form.get('description')?.touched) {
                <p class="text-xs text-red-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Minimum 20 characters
                </p>
              } @else { <span></span> }
              <span class="text-xs text-slate-400">{{ form.value.description?.length || 0 }} chars</span>
            </div>
          </div>

          <!-- Skills -->
          <div class="form-group" (focusin)="currentStep.set(3)">
            <label class="form-label">Required Skills</label>
            <div class="flex gap-2">
              <input [(ngModel)]="newSkill" [ngModelOptions]="{standalone: true}" type="text"
                class="form-input flex-1" placeholder="Type a skill and press Enter…"
                (keydown.enter)="$event.preventDefault(); addSkill()"/>
              <button type="button" (click)="addSkill()" class="btn-secondary px-4 shrink-0">Add</button>
            </div>
            @if (skills().length > 0) {
              <div class="flex flex-wrap gap-2 mt-3">
                @for (skill of skills(); track skill) {
                  <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                    {{ skill }}
                    <button type="button" (click)="removeSkill(skill)"
                      class="w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center transition-colors">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </span>
                }
              </div>
            } @else {
              <p class="text-xs text-slate-400 mt-2">No skills added yet</p>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit" class="btn-primary flex-1 py-3" [disabled]="loading()">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Publishing…
              } @else {
                Publish Job
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              }
            </button>
            <a routerLink="/jobs" class="btn-ghost px-5">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateJobComponent {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private router = inject(Router);
  private toast = inject(ToastService);

  steps = [
    { n: 1, label: 'Title' },
    { n: 2, label: 'Description' },
    { n: 3, label: 'Skills' }
  ];
  currentStep = signal(1);

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]]
  });

  skills = signal<string[]>([]);
  newSkill = '';
  loading = signal(false);
  error = signal('');

  addSkill() {
    const s = this.newSkill.trim();
    if (s && !this.skills().includes(s)) this.skills.update(arr => [...arr, s]);
    this.newSkill = '';
  }

  removeSkill(skill: string) { this.skills.update(arr => arr.filter(s => s !== skill)); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.jobService.create({
      title: this.form.value.title!,
      description: this.form.value.description!,
      skillsRequired: this.skills()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Job posted successfully!');
        this.router.navigate(['/jobs']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error || 'Failed to post job. Please try again.');
        this.toast.error('Failed to post job');
      }
    });
  }
}
