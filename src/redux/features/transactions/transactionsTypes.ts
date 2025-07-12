import { User } from "../users/usersTypes";
import { Order } from "../orders/ordersTypes";

export interface Transaction {
    id: string;
    order_id: string;
    user_id: string;
    transaction_amount: number;
    currency: string;
    payment_gateway: string;
    gateway_transaction_id?: string;
    transaction_status: "pending" | "succeeded" | "failed" | "refunded";
    transaction_type: "sale" | "refund" | "authorization";
    error_message?: string;
    created_at: string;
    updated_at: string;
    users?: User;
    orders?: Order;
}

export interface UpdateTransaction {
    id: string;
    transaction_status?: string;
    error_message?: string;
}
