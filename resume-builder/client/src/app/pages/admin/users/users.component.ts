import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  avatar: string;
  planPurchased: string;
  isActive: boolean;
  createdAt: string;
  resumeCount: number;
  purchaseCount: number;
}

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  avatar: string;
  planPurchased: string;
  isActive: boolean;
  createdAt: string;
  resumeCount: number;
  purchaseCount: number;
  draftCount: number;
}

interface PaginatedUsers {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: UserRow[] = [];
  total = 0;
  activeCount = 0;
  inactiveCount = 0;
  page = 1;
  pageSize = 20;
  totalPages = 1;
  search = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  isLoading = true;

  // Detail modal
  selectedUser: UserDetail | null = null;
  showDetailModal = false;
  loadingDetail = false;

  // Add/Edit modal
  showEditModal = false;
  isEditMode = false;
  editingUserId: string | null = null;
  isSubmitting = false;
  editForm = {
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    avatar: '',
    planPurchased: 'Free',
    isActive: true,
  };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.search = term;
        this.page = 1;
        this.loadUsers();
      });
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onStatusFilterChange(): void {
    this.page = 1;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());
    if (this.search) params = params.set('search', this.search);
    if (this.statusFilter !== 'all') params = params.set('status', this.statusFilter);

    this.api.get<PaginatedUsers>('/admin/users', params).subscribe({
      next: (data) => {
        const raw = data as any;
        this.users = (raw.users || []).map((u: any) => ({
          id: u.id ?? u.Id,
          firstName: u.firstName ?? u.FirstName ?? '',
          lastName: u.lastName ?? u.LastName ?? '',
          fullName: u.fullName ?? u.FullName ?? '',
          email: u.email ?? u.Email ?? '',
          username: u.username ?? u.Username ?? '',
          phone: u.phone ?? u.Phone ?? '',
          avatar: u.avatar ?? u.Avatar ?? '',
          planPurchased: u.planPurchased ?? u.PlanPurchased ?? 'Free',
          isActive: u.isActive ?? u.IsActive ?? true,
          createdAt: u.createdAt ?? u.CreatedAt ?? '',
          resumeCount: u.resumeCount ?? u.ResumeCount ?? 0,
          purchaseCount: u.purchaseCount ?? u.PurchaseCount ?? 0,
        }));
        this.total = raw.total ?? raw.Total ?? 0;
        this.totalPages = raw.totalPages ?? raw.TotalPages ?? 1;
        this.activeCount = raw.activeCount ?? raw.ActiveCount ?? 0;
        this.inactiveCount = raw.inactiveCount ?? raw.InactiveCount ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load users');
        this.isLoading = false;
      },
    });
  }

  toggleStatus(user: UserRow): void {
    const prev = user.isActive;
    this.api.put<any>(`/admin/users/${user.id}/toggle-status`).subscribe({
      next: () => {
        user.isActive = !prev;
        this.activeCount += user.isActive ? 1 : -1;
        this.inactiveCount += user.isActive ? -1 : 1;
        this.toast.success(`User ${user.isActive ? 'activated' : 'blocked'}`);
      },
      error: () => this.toast.error('Failed to toggle user status'),
    });
  }

  deleteUser(user: UserRow): void {
    if (!confirm(`Delete "${user.fullName}"? This cannot be undone.`)) return;
    this.api.delete(`/admin/users/${user.id}`).subscribe({
      next: () => {
        this.toast.success('User deleted');
        this.loadUsers();
      },
      error: () => this.toast.error('Failed to delete user'),
    });
  }

  viewDetails(user: UserRow): void {
    this.loadingDetail = true;
    this.showDetailModal = true;
    this.api.get<any>(`/admin/users/${user.id}`).subscribe({
      next: (raw: any) => {
        this.selectedUser = {
          id: raw.id ?? raw.Id ?? user.id,
          firstName: raw.firstName ?? raw.FirstName ?? '',
          lastName: raw.lastName ?? raw.LastName ?? '',
          fullName: raw.fullName ?? raw.FullName ?? user.fullName,
          email: raw.email ?? raw.Email ?? user.email,
          username: raw.username ?? raw.Username ?? '',
          phone: raw.phone ?? raw.Phone ?? '',
          avatar: raw.avatar ?? raw.Avatar ?? user.avatar,
          planPurchased: raw.planPurchased ?? raw.PlanPurchased ?? 'Free',
          isActive: raw.isActive ?? raw.IsActive ?? user.isActive,
          createdAt: raw.createdAt ?? raw.CreatedAt ?? user.createdAt,
          resumeCount: raw.resumeCount ?? raw.ResumeCount ?? 0,
          purchaseCount: raw.purchaseCount ?? raw.PurchaseCount ?? 0,
          draftCount: raw.draftCount ?? raw.DraftCount ?? 0,
        };
        this.loadingDetail = false;
      },
      error: () => {
        this.toast.error('Failed to load user details');
        this.loadingDetail = false;
        this.showDetailModal = false;
      },
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingUserId = null;
    this.editForm = {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      username: '',
      phone: '',
      password: '',
      avatar: '',
      planPurchased: 'Free',
      isActive: true,
    };
    this.showEditModal = true;
  }

  openEditModal(user: UserRow): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.editForm = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: user.fullName || '',
      email: user.email,
      username: user.username || '',
      phone: user.phone || '',
      password: '',
      avatar: user.avatar || '',
      planPurchased: user.planPurchased || 'Free',
      isActive: user.isActive,
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingUserId = null;
  }

  saveUser(): void {
    if (!this.editForm.firstName.trim() || !this.editForm.email.trim()) {
      this.toast.warning('First name and email are required');
      return;
    }
    this.isSubmitting = true;
    const payload = {
      ...this.editForm,
      fullName: (this.editForm.firstName.trim() + ' ' + this.editForm.lastName.trim()).trim(),
    };

    if (this.isEditMode && this.editingUserId) {
      this.api
        .put<any>(`/admin/users/${this.editingUserId}`, payload)
        .subscribe({
          next: () => {
            this.toast.success('User updated');
            this.isSubmitting = false;
            this.closeEditModal();
            this.loadUsers();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.toast.error('Failed to update: ' + (err.error?.error || 'Unknown error'));
          },
        });
    } else {
      this.api.post<any>('/admin/users', payload).subscribe({
        next: () => {
          this.toast.success('User created');
          this.isSubmitting = false;
          this.closeEditModal();
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error('Failed to create: ' + (err.error?.error || 'Unknown error'));
        },
      });
    }
  }

  exportCSV(): void {
    if (!this.users.length) {
      this.toast.warning('No users to export');
      return;
    }
    const headers = ['ID', 'First Name', 'Last Name', 'Username', 'Email', 'Phone', 'Plan', 'Status', 'Resumes', 'Purchases', 'Created At'];
    const rows = this.users.map((u) => [
      u.id,
      `"${(u.firstName || '').replace(/"/g, '""')}"`,
      `"${(u.lastName || '').replace(/"/g, '""')}"`,
      u.username || '',
      u.email,
      u.phone || '',
      u.planPurchased || 'Free',
      u.isActive ? 'Active' : 'Inactive',
      u.resumeCount,
      u.purchaseCount,
      new Date(u.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('CSV exported');
  }

  onImportCSV(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        this.toast.warning('CSV file is empty or has no data rows');
        return;
      }
      const imported = lines
        .slice(1)
        .map((line) => {
          const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
          return {
            firstName: parts[1] || '',
            lastName: parts[2] || '',
            fullName: ((parts[1] || '') + ' ' + (parts[2] || '')).trim(),
            email: parts[4] || '',
            username: parts[3] || '',
            phone: parts[5] || '',
            planPurchased: parts[6] || 'Free',
            isActive: parts[7] !== 'Inactive',
          };
        })
        .filter((u) => u.email);
      if (!imported.length) {
        this.toast.warning('No valid rows found in CSV');
        return;
      }
      this.toast.info(`Importing ${imported.length} users...`);
      let done = 0;
      let errors = 0;
      imported.forEach((u) => {
        this.api
          .post<any>('/admin/users', { ...u, avatar: '', password: '' })
          .subscribe({
            next: () => {
              done++;
              if (done + errors === imported.length) {
                this.toast.success(`Import complete: ${done} imported, ${errors} failed`);
                this.loadUsers();
              }
            },
            error: () => {
              errors++;
              if (done + errors === imported.length) {
                this.toast.success(`Import complete: ${done} imported, ${errors} failed`);
                this.loadUsers();
              }
            },
          });
      });
    };
    reader.readAsText(file);
    input.value = '';
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  getInitials(name: string): string {
    return (name || '?')
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getPageEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'Pro': return 'bg-primary';
      case 'Enterprise': return 'bg-purple text-white';
      default: return 'bg-secondary';
    }
  }
}
