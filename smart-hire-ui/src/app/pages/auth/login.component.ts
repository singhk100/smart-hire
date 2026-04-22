import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">

      <!-- Left panel — Illustration -->
      <div class="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style="background:linear-gradient(145deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)">
        <div class="absolute inset-0 opacity-10"
          style="background-image:radial-gradient(circle,white 1px,transparent 1px);background-size:28px 28px"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-16">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-xl font-bold">SmartHire</span>
          </div>
          <h2 class="text-4xl font-bold leading-tight mb-4">Find your dream job<br/>with AI-powered<br/>matching</h2>
          <p class="text-indigo-200 text-lg">Connect with top recruiters and land your next opportunity.</p>
          <div class="mt-10 space-y-4">
            @for (feat of features; track feat) {
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-sm text-indigo-100">{{ feat }}</span>
              </div>
            }
          </div>
        </div>
        <div class="relative">
          <div class="flex -space-x-2 mb-3">
            @for (c of colors; track c) {
              <div class="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white"
                [style.background]="c">U</div>
            }
          </div>
          <p class="text-sm text-indigo-200">Join <span class="font-bold text-white">10,000+</span> professionals already on SmartHire</p>
        </div>
      </div>

      <!-- Right panel — Form -->
      <div class="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div class="w-full max-w-md scale-in">

          <!-- Mobile logo -->
          <div class="flex items-center gap-2 mb-8 lg:hidden">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="font-bold text-slate-900 text-xl">SmartHire</span>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p class="text-slate-500 text-sm mb-8">Sign in to continue to SmartHire</p>

          <!-- Error alert -->
          @if (error()) {
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5 fade-in">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div class="form-group">
              <label class="form-label">Email address</label>
              <input formControlName="email" type="email" class="form-input" placeholder="you@company.com" autocomplete="email"/>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-xs text-red-500 mt-1">Please enter a valid email</p>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                  class="form-input pr-10" placeholder="••••••••" autocomplete="current-password"/>
                <button type="button" (click)="showPwd.set(!showPwd())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                  @if (showPwd()) {
                    <svg class="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-xs text-red-500 mt-1">Password is required</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full py-3 text-base mt-2" [disabled]="loading()">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in…
              } @else {
                Sign in
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              }
            </button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-6">
            Don't have an account?
            <a routerLink="/register" class="font-semibold text-indigo-600 hover:text-indigo-700 ml-1 transition-colors">Create one free</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  features = ['AI-powered resume scoring', 'Direct recruiter matching', 'Real-time application tracking'];
  colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981'];

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading  = signal(false);
  error    = signal('');
  showPwd  = signal(false);

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading.set(false); this.error.set(err.error || 'Invalid credentials. Please try again.'); }
    });
  }
}
