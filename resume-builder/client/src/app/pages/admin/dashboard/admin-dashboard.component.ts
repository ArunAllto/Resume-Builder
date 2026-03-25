import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface AdminStats {
  totalTemplates: number;
  activeTemplates: number;
  totalResumes: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<AdminStats>('/admin/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load dashboard stats.';
        this.isLoading = false;
        this.toast.error('Failed to load dashboard stats');
      },
    });
  }
}
