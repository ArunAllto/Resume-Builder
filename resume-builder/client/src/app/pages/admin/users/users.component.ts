import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  resumeCount: number;
  googleLinked?: boolean;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  googleLinked: boolean;
  resumeCount: number;
  purchaseCount: number;
  draftCount: number;
}

interface PaginatedUsers {
  users: User[];
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
  users: User[] = [];
  total = 0;
  activeCount = 0;
  inactiveCount = 0;
  page = 1;
  pageSize = 20;
  totalPages = 1;
  search = '';
  isLoading = true;

  selectedUser: UserDetail | null = null;
  showModal = false;
  loadingDetail = false;

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

  loadUsers(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());
    if (this.search) {
      params = params.set('search', this.search);
    }

    this.api.get<PaginatedUsers>('/admin/users', params).subscribe({
      next: (data) => {
        this.users = data.users;
        this.total = data.total;
        this.totalPages = data.totalPages;
        this.activeCount = data.activeCount;
        this.inactiveCount = data.inactiveCount;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load users');
        this.isLoading = false;
      },
    });
  }

  toggleStatus(user: User): void {
    this.api.put<any>(`/admin/users/${user._id}/toggle-status`).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.activeCount += user.isActive ? 1 : -1;
        this.inactiveCount += user.isActive ? -1 : 1;
        this.toast.success(`User ${user.isActive ? 'activated' : 'disabled'}`);
      },
      error: () => this.toast.error('Failed to toggle user status'),
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      return;
    }
    this.api.delete(`/admin/users/${user._id}`).subscribe({
      next: () => {
        this.toast.success('User deleted');
        this.loadUsers();
      },
      error: () => this.toast.error('Failed to delete user'),
    });
  }

  viewDetails(user: User): void {
    this.loadingDetail = true;
    this.showModal = true;
    this.api.get<UserDetail>(`/admin/users/${user._id}`).subscribe({
      next: (data) => {
        this.selectedUser = data;
        this.loadingDetail = false;
      },
      error: () => {
        this.toast.error('Failed to load user details');
        this.loadingDetail = false;
        this.showModal = false;
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
