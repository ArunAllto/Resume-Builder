import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../../../core/services/purchase.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-modal.component.html',
  styleUrls: ['./purchase-modal.component.scss']
})
export class PurchaseModalComponent {
  @Input() visible = false;
  @Input() template: any = null;
  @Output() purchased = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  loading = false;

  // Coupon properties
  couponCode = '';
  couponApplied = false;
  applyingCoupon = false;
  couponError = '';
  discountAmount = 0;
  discountText = '';

  constructor(
    private purchaseService: PurchaseService,
    private api: ApiService,
    private toast: ToastService
  ) {}

  get discount(): number {
    if (!this.template?.originalPrice || !this.template?.offerPrice) return 0;
    return Math.round((1 - this.template.offerPrice / this.template.originalPrice) * 100);
  }

  get finalPrice(): number {
    const base = this.template?.offerPrice || this.template?.originalPrice || 0;
    return Math.max(0, base - this.discountAmount);
  }

  close(): void { this.closed.emit(); }

  applyCoupon(): void {
    if (!this.couponCode || this.couponApplied || this.applyingCoupon) return;
    this.applyingCoupon = true;
    this.couponError = '';

    const price = this.template?.offerPrice || this.template?.originalPrice || 0;

    this.api.post<any>('/coupons/validate', { code: this.couponCode }).subscribe({
      next: (data) => {
        this.applyingCoupon = false;
        this.couponApplied = true;
        if (data.discountType === 'percentage') {
          this.discountAmount = Math.round(price * data.discountValue / 100);
          this.discountText = `${data.discountValue}% off`;
        } else {
          this.discountAmount = data.discountValue;
          this.discountText = `\u20B9${data.discountValue} off`;
        }
      },
      error: (err) => {
        this.applyingCoupon = false;
        this.couponError = err?.error?.error || 'Invalid coupon code';
      }
    });
  }

  onPurchase(): void {
    if (!this.template) return;
    this.loading = true;
    this.purchaseService.purchaseTemplate(this.template.id).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Template purchased successfully!');
        this.purchased.emit();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.error || 'Purchase failed');
      }
    });
  }
}
