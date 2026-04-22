import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50">
      <app-navbar></app-navbar>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <footer class="bg-white border-t border-slate-100 py-6 mt-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-sm font-bold text-slate-700">SmartHire</span>
          </div>
          <p class="text-xs text-slate-400">© 2026 SmartHire — Connecting Talent with Opportunity</p>
        </div>
      </footer>
    </div>
    <app-toast></app-toast>
  `
})
export class App {}
