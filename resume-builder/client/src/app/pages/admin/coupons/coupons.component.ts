import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss',
})
export class CouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  isLoading = true;
  errorMessage = '';

  // Form state
  showForm = false;
  isEditing = false;
  isSubmitting = false;
  editingId: string | null = null;

  formCode = '';
  formDiscountType: 'percentage' | 'flat' = 'percentage';
  formDiscountValue: number | null = null;
  formMaxUses: number | null = null;
  formExpiryDate = '';
  formIsActive = true;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  // Stats
  get totalCoupons(): number {
    return this.coupons.length;
  }

  get activeCoupons(): number {
    return this.coupons.filter((c) => c.isActive && !this.isExpired(c) && !this.isMaxedOut(c)).length;
  }

  get totalUses(): number {
    return this.coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<Coupon[]>('/coupons').subscribe({
      next: (data) => {
        this.coupons = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load coupons.';
        this.isLoading = false;
        this.toast.error('Failed to load coupons');
      },
    });
  }

  showAddForm(): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = false;
  }

  showEditForm(c: Coupon): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = true;
    this.editingId = c.id;
    this.formCode = c.code;
    this.formDiscountType = c.discountType;
    this.formDiscountValue = c.discountValue;
    this.formMaxUses = c.maxUses;
    this.formExpiryDate = c.expiryDate ? c.expiryDate.substring(0, 10) : '';
    this.formIsActive = c.isActive;
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formCode = '';
    this.formDiscountType = 'percentage';
    this.formDiscountValue = null;
    this.formMaxUses = null;
    this.formExpiryDate = '';
    this.formIsActive = true;
    this.editingId = null;
    this.isEditing = false;
  }

  onCodeInput(): void {
    this.formCode = this.formCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  saveCoupon(): void {
    if (!this.formCode.trim()) {
      this.toast.warning('Coupon code is required');
      return;
    }
    if (!this.formDiscountValue || this.formDiscountValue <= 0) {
      this.toast.warning('Discount value must be greater than 0');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      code: this.formCode.trim().toUpperCase(),
      discountType: this.formDiscountType,
      discountValue: this.formDiscountValue,
      maxUses: this.formMaxUses || 0,
      expiryDate: this.formExpiryDate || null,
      isActive: this.formIsActive,
    };

    if (this.isEditing && this.editingId) {
      this.api.put<Coupon>(`/coupons/${this.editingId}`, payload).subscribe({
        next: (updated) => {
          const idx = this.coupons.findIndex((c) => c.id === this.editingId);
          if (idx !== -1) this.coupons[idx] = updated;
          this.isSubmitting = false;
          this.showForm = false;
          this.resetForm();
          this.toast.success('Coupon updated');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error('Failed to update: ' + (err.error?.error || 'Unknown error'));
        },
      });
    } else {
      this.api.post<Coupon>('/coupons', payload).subscribe({
        next: (created) => {
          this.coupons.unshift(created);
          this.isSubmitting = false;
          this.showForm = false;
          this.resetForm();
          this.toast.success('Coupon created');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error('Failed to create: ' + (err.error?.error || 'Unknown error'));
        },
      });
    }
  }

  toggleActive(c: Coupon): void {
    this.api.put<Coupon>(`/coupons/${c.id}`, { isActive: !c.isActive }).subscribe({
      next: () => {
        const idx = this.coupons.findIndex((x) => x.id === c.id);
        if (idx !== -1) this.coupons[idx] = { ...this.coupons[idx], isActive: !c.isActive };
        this.toast.info(c.isActive ? 'Coupon deactivated' : 'Coupon activated');
      },
      error: () => this.toast.error('Failed to toggle status'),
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(
      () => this.toast.success(`Copied "${code}" to clipboard`),
      () => this.toast.error('Failed to copy')
    );
  }

  deleteCoupon(c: Coupon): void {
    if (!window.confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return;

    this.api.delete(`/coupons/${c.id}`).subscribe({
      next: () => {
        this.coupons = this.coupons.filter((x) => x.id !== c.id);
        this.toast.success('Coupon deleted');
      },
      error: () => this.toast.error('Failed to delete coupon'),
    });
  }

  isExpired(c: Coupon): boolean {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate) < new Date();
  }

  isMaxedOut(c: Coupon): boolean {
    if (!c.maxUses) return false;
    return c.usedCount >= c.maxUses;
  }

  getStatusBadge(c: Coupon): { label: string; class: string } {
    if (!c.isActive) return { label: 'Inactive', class: 'bg-secondary-subtle text-secondary' };
    if (this.isExpired(c)) return { label: 'Expired', class: 'bg-danger-subtle text-danger' };
    if (this.isMaxedOut(c)) return { label: 'Maxed Out', class: 'bg-warning-subtle text-warning' };
    return { label: 'Active', class: 'bg-success-subtle text-success' };
  }

  formatDiscount(c: Coupon): string {
    return c.discountType === 'percentage' ? `${c.discountValue}%` : `\u20B9${c.discountValue}`;
  }
}
