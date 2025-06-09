import { IOrder } from "@/interface/order/order.interface";
import { Orders } from "razorpay/dist/types/orders";

export interface IPaymentService {
    create(amount: string): Promise<Orders.RazorpayOrder>
    retry(paymentId: string, orderId: string): Promise<IOrder>
}