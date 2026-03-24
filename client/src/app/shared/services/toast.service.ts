import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

const DEFAULT_DURATIONS: Record<Toast['type'], number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

const MAX_TOASTS = 5;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = [];
  toasts$ = new BehaviorSubject<Toast[]>([]);

  success(message: string, duration?: number): void {
    this.addToast('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.addToast('error', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.addToast('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.addToast('info', message, duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.toasts$.next([...this.toasts]);
  }

  private addToast(type: Toast['type'], message: string, duration?: number): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      message,
      duration: duration ?? DEFAULT_DURATIONS[type],
    };

    this.toasts.push(toast);

    // Keep max visible toasts
    if (this.toasts.length > MAX_TOASTS) {
      this.toasts = this.toasts.slice(-MAX_TOASTS);
    }

    this.toasts$.next([...this.toasts]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }
}
