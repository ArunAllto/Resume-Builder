import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { HttpParams } from '@angular/common/http';

interface OrderRow {
  id: string;
  orderNumber: string;
  userEmail: string;
  userName: string;
  templateName: string;
  amount: number;
  discountAmount: number;
  couponCode: string | null;
  finalAmount: number;
  currency: string;
  status: string;
  gateway: string;
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface PaginatedOrders {
  orders: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orders: OrderRow[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  totalPages = 1;
  successCount = 0;
  pendingCount = 0;
  failedCount = 0;
  totalRevenue = 0;

  statusFilter = '';
  gatewayFilter = '';
  isLoading = true;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());
    if (this.statusFilter) params = params.set('status', this.statusFilter);
    if (this.gatewayFilter) params = params.set('gateway', this.gatewayFilter);

    this.api.get<PaginatedOrders>('/admin/orders', params).subscribe({
      next: (data) => {
        this.orders = data.orders || [];
        this.total = data.total || 0;
        this.totalPages = data.totalPages || 1;
        this.successCount = data.successCount || 0;
        this.pendingCount = data.pendingCount || 0;
        this.failedCount = data.failedCount || 0;
        this.totalRevenue = data.totalRevenue || 0;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load orders');
        this.isLoading = false;
      },
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Success': return 'bg-success-subtle text-success';
      case 'Pending': return 'bg-warning-subtle text-warning';
      case 'Failed': return 'bg-danger-subtle text-danger';
      case 'Refunded': return 'bg-info-subtle text-info';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  getGatewayBadgeClass(gateway: string): string {
    switch (gateway) {
      case 'razorpay': return 'bg-primary-subtle text-primary';
      case 'stripe': return 'bg-indigo-subtle text-indigo';
      case 'coupon': return 'bg-success-subtle text-success';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadOrders();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getPageEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }
}
