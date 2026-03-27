import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { forkJoin } from 'rxjs';

interface AdminStats {
  totalTemplates: number;
  activeTemplates: number;
  totalResumes: number;
  totalUsers: number;
  totalRevenue: number;
}

interface ResumeTrendItem {
  date: string;
  count: number;
}

interface PopularTemplate {
  name: string;
  count: number;
}

interface UserTrendItem {
  date: string;
  count: number;
}

interface RevenueSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  totalPurchases: number;
  thisMonthPurchases: number;
}

interface ActivityItem {
  type: 'signup' | 'resume' | 'purchase';
  description: string;
  time: string;
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
  resumeTrends: ResumeTrendItem[] = [];
  popularTemplates: PopularTemplate[] = [];
  userTrends: UserTrendItem[] = [];
  revenue: RevenueSummary | null = null;
  recentActivity: ActivityItem[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      stats: this.api.get<AdminStats>('/admin/stats'),
      resumeTrends: this.api.get<ResumeTrendItem[]>('/admin/analytics/resume-trends?days=30'),
      popularTemplates: this.api.get<PopularTemplate[]>('/admin/analytics/popular-templates?limit=5'),
      userTrends: this.api.get<UserTrendItem[]>('/admin/analytics/user-trends?days=30'),
      revenue: this.api.get<RevenueSummary>('/admin/analytics/revenue'),
      recentActivity: this.api.get<ActivityItem[]>('/admin/analytics/recent-activity?limit=15'),
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.resumeTrends = data.resumeTrends;
        this.popularTemplates = data.popularTemplates;
        this.userTrends = data.userTrends;
        this.revenue = data.revenue;
        this.recentActivity = data.recentActivity;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load dashboard data.';
        this.isLoading = false;
        this.toast.error('Failed to load dashboard data');
      },
    });
  }

  // --- Chart helpers ---

  get resumeTrendMax(): number {
    return Math.max(1, ...this.resumeTrends.map((r) => r.count));
  }

  getBarHeight(count: number, max: number): number {
    return max === 0 ? 0 : Math.max(4, (count / max) * 100);
  }

  get userTrendMax(): number {
    return Math.max(1, ...this.userTrends.map((u) => u.count));
  }

  get popularTemplateMax(): number {
    return Math.max(1, ...this.popularTemplates.map((t) => t.count));
  }

  getBarWidth(count: number, max: number): number {
    return max === 0 ? 0 : Math.max(4, (count / max) * 100);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'signup': return 'bi-person-plus';
      case 'resume': return 'bi-file-earmark';
      case 'purchase': return 'bi-cart';
      default: return 'bi-activity';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'signup': return 'text-success';
      case 'resume': return 'text-primary';
      case 'purchase': return 'text-warning';
      default: return 'text-secondary';
    }
  }

  getActivityBg(type: string): string {
    switch (type) {
      case 'signup': return 'bg-success-subtle';
      case 'resume': return 'bg-primary-subtle';
      case 'purchase': return 'bg-warning-subtle';
      default: return 'bg-secondary-subtle';
    }
  }

  getRelativeTime(time: string): string {
    const now = new Date();
    const then = new Date(time);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return then.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
}
