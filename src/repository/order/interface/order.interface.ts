import { OrderStatus } from "@/constants";
import { IOrder, IOrderItem } from "@/interface/order/order.interface";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from "@/types";

export interface IOrderRepository<T extends IOrder> extends IBaseRepository<IOrder> {
    createOrder(order: any): Promise<any>;
    getOrderById(id: string): Promise<T | null>;
    getOrderByOrderId(orderId: string): Promise<T | null>
    cancelOrderById(id: string): Promise<T | null>;
    getOrderByUserId(userId: string): Promise<T[] | null>
    getOneOrderById(userId: string, orderId: string): Promise<IOrderItem>
    getOneOrderBySKU(sku: string, orderId: string): Promise<IOrderItem>
    getOrderDetails(userId: string, orderId: string): Promise<T | null>
    updateOrderStatus(id: string, status: T["status"]): Promise<T | null>;
    getAllOrderByUser(userId: string, skip: number, limit: number,query:any): Promise<PaginationResponse<T> | null>
    getAllOrderByVendor(vendorId: string, skip: number, limit: number,query:any): Promise<PaginationResponse<T> | null>
    updateOrder(orderId: string, updatedData: Partial<T>): Promise<T | null>
    updateOneItem(sku: string, orderId: string, status: OrderStatus): Promise<IOrderItem | null>
}
