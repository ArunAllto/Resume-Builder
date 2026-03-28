import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../services/toast.service';
import { CreateOrderResponse } from '../../../core/models/order.model';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-modal.component.html',
  styleUrl: './purchase-modal.component.scss',
})
export class PurchaseModalComponent {
  @Input() template: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() purchased = new EventEmitter<void>();

  // Steps: pricing, payment-method, processing, success, failure
  currentStep: 'pricing' | 'payment-method' | 'processing' | 'success' | 'failure' = 'pricing';

  // Coupon
  couponCode = '';
  couponApplied = false;
  couponLoading = false;
  couponError = '';
  discountAmount = 0;
  discountLabel = '';

  // Payment method
  selectedGateway: 'razorpay' | 'stripe' = 'razorpay';

  // Order
  orderData: CreateOrderResponse | null = null;
  paymentId = '';
  orderNumber = '';

  // Error
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private api: ApiService,
    private userService: UserService,
    private toast: ToastService
  ) {}

  get price(): number {
    return this.template?.offerPrice ?? this.template?.originalPrice ?? 0;
  }

  get originalPrice(): number {
    return this.template?.originalPrice ?? 0;
  }

  get hasDiscount(): boolean {
    return this.template?.offerPrice && this.template?.originalPrice && this.template.offerPrice < this.template.originalPrice;
  }

  get discountPercent(): number {
    if (!this.hasDiscount) return 0;
    return Math.round((1 - this.template.offerPrice / this.template.originalPrice) * 100);
  }

  get finalPrice(): number {
    return Math.max(0, this.price - this.discountAmount);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.couponLoading = true;
    this.couponError = '';

    this.api.post<any>('/coupons/validate', { code: this.couponCode.trim() }).subscribe({
      next: (data) => {
        this.couponApplied = true;
        this.couponLoading = false;
        if (data.discountType === 'percent') {
          this.discountAmount = Math.round(this.price * data.discountValue / 100);
          this.discountLabel = `${data.discountValue}% off`;
        } else {
          this.discountAmount = data.discountValue;
          this.discountLabel = `\u20B9${data.discountValue} off`;
        }
        this.toast.success('Coupon applied!');
      },
      error: (err) => {
        this.couponLoading = false;
        this.couponError = err.error?.error || 'Invalid coupon code';
        this.couponApplied = false;
        this.discountAmount = 0;
      },
    });
  }

  removeCoupon(): void {
    this.couponApplied = false;
    this.couponCode = '';
    this.discountAmount = 0;
    this.discountLabel = '';
    this.couponError = '';
  }

  continueToPay(): void {
    this.currentStep = 'payment-method';
  }

  selectGateway(gw: 'razorpay' | 'stripe'): void {
    this.selectedGateway = gw;
  }

  async startPayment(): Promise<void> {
    this.currentStep = 'processing';
    this.errorMessage = '';

    try {
      // Step 1: Create order on backend
      const orderResponse = await firstValueFrom(this.paymentService.createOrder({
        templateId: this.template.id,
        paymentGateway: this.selectedGateway,
        couponCode: this.couponApplied ? this.couponCode : undefined,
      }));

      if (!orderResponse) throw new Error('Failed to create order');
      this.orderData = orderResponse;

      // If 100% discount
      if (orderResponse.status === 'Success') {
        this.orderNumber = orderResponse.orderNumber;
        this.paymentId = 'COUPON-DISCOUNT';
        this.currentStep = 'success';
        return;
      }

      // Step 2: Open payment gateway
      const user = this.userService.getUser();
      const userName = user?.fullName || '';
      const userEmail = user?.email || '';

      if (this.selectedGateway === 'razorpay') {
        const rzpResponse = await this.paymentService.initiateRazorpayPayment(orderResponse, userName, userEmail);

        // Step 3: Verify on backend
        const verifyResponse = await firstValueFrom(this.paymentService.verifyRazorpayPayment(
          orderResponse.orderId,
          rzpResponse.razorpay_payment_id,
          rzpResponse.razorpay_order_id,
          rzpResponse.razorpay_signature
        ));

        this.orderNumber = verifyResponse!.orderNumber;
        this.paymentId = verifyResponse!.paymentId;
        this.currentStep = 'success';

      } else {
        // Stripe flow
        const stripeResponse = await this.paymentService.initiateStripePayment(orderResponse);

        const verifyResponse = await firstValueFrom(this.paymentService.verifyStripePayment(
          orderResponse.orderId,
          stripeResponse.paymentIntentId
        ));

        this.orderNumber = verifyResponse!.orderNumber;
        this.paymentId = verifyResponse!.paymentId;
        this.currentStep = 'success';
      }
    } catch (error: any) {
      this.errorMessage = error?.message || error?.error?.error || 'Payment failed. Please try again.';
      if (this.errorMessage.includes('cancelled')) {
        this.currentStep = 'payment-method';
      } else {
        this.currentStep = 'failure';
      }
    }
  }

  retryPayment(): void {
    this.currentStep = 'payment-method';
    this.errorMessage = '';
  }

  onSuccess(): void {
    this.purchased.emit();
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
