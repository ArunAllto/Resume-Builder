import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateOrderRequest, CreateOrderResponse, VerifyPaymentResponse, OrderItem } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private api: ApiService) {}

  createOrder(data: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.api.post<CreateOrderResponse>('/orders/create', data);
  }

  verifyRazorpayPayment(orderId: string, paymentId: string, razorpayOrderId: string, signature: string): Observable<VerifyPaymentResponse> {
    return this.api.post<VerifyPaymentResponse>('/orders/verify-razorpay', {
      orderId,
      razorpayPaymentId: paymentId,
      razorpayOrderId,
      razorpaySignature: signature,
    });
  }

  verifyStripePayment(orderId: string, paymentIntentId: string): Observable<VerifyPaymentResponse> {
    return this.api.post<VerifyPaymentResponse>('/orders/verify-stripe', {
      orderId,
      paymentIntentId,
    });
  }

  getMyOrders(): Observable<OrderItem[]> {
    return this.api.get<OrderItem[]>('/orders/my-orders');
  }

  getOrder(id: string): Observable<any> {
    return this.api.get<any>(`/orders/${id}`);
  }

  initiateRazorpayPayment(orderData: CreateOrderResponse, userName: string, userEmail: string): Promise<RazorpayResponse> {
    // Sandbox mode — skip real gateway popup
    if (orderData.gatewayOrderId?.startsWith('sandbox_')) {
      return Promise.resolve({
        razorpay_payment_id: `sandbox_pay_${Date.now()}`,
        razorpay_order_id: orderData.gatewayOrderId,
        razorpay_signature: 'sandbox_signature',
      });
    }

    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay === 'undefined') {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const options: RazorpayOptions = {
        key: orderData.razorpayKeyId || environment.razorpayKeyId,
        amount: Math.round(orderData.finalAmount * 100),
        currency: orderData.currency || 'INR',
        name: 'ResumeAI',
        description: `Template Purchase - ${orderData.orderNumber}`,
        order_id: orderData.gatewayOrderId!,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#4f46e5' },
        handler: (response: RazorpayResponse) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  async initiateStripePayment(orderData: CreateOrderResponse): Promise<{ paymentIntentId: string }> {
    // Sandbox mode — skip real gateway
    if (orderData.stripeClientSecret?.startsWith('sandbox_') || orderData.gatewayOrderId?.startsWith('sandbox_')) {
      return { paymentIntentId: orderData.gatewayOrderId || `sandbox_pi_${Date.now()}` };
    }

    if (typeof Stripe === 'undefined') {
      throw new Error('Stripe SDK not loaded');
    }

    const stripe = Stripe(environment.stripePublishableKey);
    const { error, paymentIntent } = await stripe.confirmCardPayment(orderData.stripeClientSecret!, {
      payment_method: {
        card: { token: 'tok_visa' },
      },
    });

    if (error) {
      throw new Error(error.message || 'Stripe payment failed');
    }

    return { paymentIntentId: paymentIntent.id };
  }
}
