export interface CreatePaymentIntentRequest {
    amount: number;
    currency: string;
    paymentMethodId: string;
    orderId?: string;
    userId?: string;
}

export interface CreatePaymentIntentResponse {
    clientSecret?: string;
    paymentStatus: string;
    error?: string;
}
