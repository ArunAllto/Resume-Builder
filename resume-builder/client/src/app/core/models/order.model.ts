export interface CreateOrderRequest {
  templateId: string;
  paymentGateway: 'razorpay' | 'stripe';
  couponCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  gateway: string;
  gatewayOrderId?: string;
  razorpayKeyId?: string;
  stripeClientSecret?: string;
  status?: string;
  message?: string;
}

export interface VerifyPaymentResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentId: string;
  amount: number;
  message: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  templateName: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: string;
  gateway: string;
  paymentId: string;
  createdAt: string;
  paidAt: string | null;
}
