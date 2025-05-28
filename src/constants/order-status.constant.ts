export enum OrderStatus {
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    RETURNED = "returned"
}

export enum ReturnOrderStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "compeleted",
    NONE = "none"
 }

 export enum OrderPaymentMethods{
    WALLET = "wallet",
    COD = "COD",
    ONLINE = "online"
 } 

 export enum OrderPaymentStatus{
    PENDING = "pending",
    PAID = "paid",
    FAILED  = "failed",
    REFUNDED = 'refunded',
    CANCELLED = "cancelled"
 }

export const COMMISION_RATE = 0.10;