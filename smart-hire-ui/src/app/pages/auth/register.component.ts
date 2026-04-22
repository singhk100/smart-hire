// src/app/features/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div class="w-full max-w-lg scale-in">
        <div class="card shadow-xl border-slate-100 p-8">

          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
              style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-900">Create your account</h1>
            <p class="text-slate-500 text-sm mt-1">Start your journey with SmartHire today</p>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5 fade-in">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <!-- Full name -->
            <div class="form-group">
              <label class="form-label">Full name</label>
              <input formControlName="name" type="text" class="form-input" placeholder="John Doe" autocomplete="name"/>
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="text-xs text-red-500 mt-1">Name is required</p>
              }
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">Email address</label>
              <input formControlName="email" type="email" class="form-input" placeholder="you@company.com" autocomplete="email"/>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-xs text-red-500 mt-1">Valid email required</p>
              }
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                  class="form-input pr-10" placeholder="At least 6 characters" autocomplete="new-password"/>
                <button type="button" (click)="showPwd.set(!showPwd())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showPwd()) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-xs text-red-500 mt-1">Min 6 characters required</p>
              }
            </div>

            <!-- Role picker -->
            <div class="form-group">
              <label class="form-label">I am joining as</label>
              <div class="grid grid-cols-2 gap-3">
                @for (r of roles; track r.value) {
                  <label class="cursor-pointer">
                    <input type="radio" formControlName="role" [value]="r.value" class="sr-only peer"/>
                    <div class="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200
                      peer-checked:border-indigo-500 peer-checked:bg-indigo-50
                      hover:border-indigo-300 transition-all">
                      <span class="text-2xl">{{ r.icon }}</span>
                      <div>
                        <p class="text-sm font-bold text-slate-800">{{ r.label }}</p>
                        <p class="text-xs text-slate-500">{{ r.desc }}</p>
                      </div>
                    </div>
                  </label>
                }
              </div>
              @if (form.get('role')?.invalid && form.get('role')?.touched) {
                <p class="text-xs text-red-500 mt-1">Please select a role</p>
              }
            </div>

            <!-- Submit -->
            <button type="submit" class="btn-primary w-full py-3 text-base" [disabled]="loading()">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account…
              } @else {
                Create account
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              }
            </button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-6">
            Already have an account?
            <a routerLink="/login" 
              class="font-semibold text-indigo-600 hover:text-indigo-700 ml-1 transition-colors">
              Sign in
            </a>
          </p>

        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  roles = [
    { value: 'candidate', label: 'Job Seeker', icon: '🎯', desc: 'Find & apply for jobs' },
    { value: 'recruiter', label: 'Recruiter',  icon: '🏢', desc: 'Post & manage jobs' }
  ];

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['', Validators.required]
  });

  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  submit() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value as any).subscribe({
      next: res => {
        this.loading.set(false);
        this.toast.success(res.message || 'Account created! Please sign in.');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed.');
      }
    });
  }
}
