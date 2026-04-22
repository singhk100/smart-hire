import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = ++this._counter;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  info(msg: string)    { this.show(msg, 'info'); }

  dismiss(id: number) {
    this.toasts.update(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 280);
  }
}
