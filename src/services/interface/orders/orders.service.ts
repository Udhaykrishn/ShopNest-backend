import { OrderStatus } from "@/constants";
import { IOrder } from "@/interface/order/order.interface";
import { PaginationResponse } from "@/types";

export interface IOrderService {
    createOrder(userId: string, orderData: any): Promise<any>;
    getOrderSummary(id: string): Promise<any>;
    getOrderByUserId(userId: string): Promise<any>;
    getOrderDetails(userId: string, id: string): Promise<IOrder>;
    cancelOrder(id: string): Promise<any>;
    returnOrder(orderId: string, returnReason: string, sku: string): Promise<IOrder>;
    updateStatus(sku: string, orderId: string, status: OrderStatus): Promise<IOrder>;
    cancelOrderOneItem(userId: string, orderId: string, itemOrderId: string, reason: string): Promise<IOrder>

    getAllOrderByUserId(userId: string, page: number, limit: number,search: string | null): Promise<PaginationResponse<IOrder>>;
    getOrderByVendor(vendorId: string, page: number, limit: number,search:string): Promise<PaginationResponse<IOrder>>;

    createReturnRequest(userId: string, orderId: string, reason: string, sku: string,): Promise<IOrder>
    approveReturnRequest(orderId: string, sku: string,reason:string): Promise<IOrder>;
    rejectReturnRequest(orderId: string, sku: string, reason: string): Promise<IOrder>;
    getReturnStatus(orderId: string, vendorId: string): Promise<IOrder>;
}
