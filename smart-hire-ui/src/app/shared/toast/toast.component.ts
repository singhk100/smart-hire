import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none" style="max-width:360px;width:calc(100vw - 32px)">
      @for (toast of svc.toasts(); track toast.id) {
        <div [class]="'toast-in ' + (!toast.leaving ? 'toast-in' : 'toast-out') + ' ' + typeClass(toast.type)"
          style="pointer-events:auto">

          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            }
            @if (toast.type === 'error') {
              <div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            }
            @if (toast.type === 'info') {
              <div class="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 16h-1v-4h-1m1-4h.01"/>
                </svg>
              </div>
            }
          </div>

          <!-- Message -->
          <span class="flex-1 leading-snug">{{ toast.message }}</span>

          <!-- Close -->
          <button (click)="svc.dismiss(toast.id)"
            class="shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  svc = inject(ToastService);

  typeClass(type: string) {
    if (type === 'success') return 'toast-success';
    if (type === 'error')   return 'toast-error';
    return 'toast-info';
  }
}
