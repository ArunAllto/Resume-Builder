import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  remove(id: string): void {
    this.toastService.remove(id);
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="currentColor" opacity="0.15"/>
          <path d="M6.5 10l2.5 2.5L13.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      case 'error':
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="currentColor" opacity="0.15"/>
          <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case 'warning':
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L1 18h18L10 2z" fill="currentColor" opacity="0.15"/>
          <path d="M10 8v4M10 14.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case 'info':
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="currentColor" opacity="0.15"/>
          <path d="M10 9v4M10 6.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
  }
}
