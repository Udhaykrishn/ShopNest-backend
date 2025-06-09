import { IOrder, IOrderItem } from "@/interface/order/order.interface";
import { IOrderRepository } from "../interface/order.interface";
import { Order } from "@/models/orders/order.model";
import { injectable } from "inversify";
import { PaginationResponse } from '@/types/pagination/pagination.type';
import { OrderPaymentStatus, OrderStatus } from "@/constants";
import { PipelineStage } from "mongoose";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class OrderRepository extends BaseRepository<IOrder> implements IOrderRepository<IOrder> {
    constructor(){
        super(Order)
    }
    
    async createOrder(order: any): Promise<any> {
        return await Order.create(order);
    }

    async getOrderById(orderId: string): Promise<IOrder | null> {
        return await Order.findById(orderId);
    }

    async getOrderByOrderId(orderId: string): Promise<IOrder | null> {
        return await Order.findOne({ orderId })
    }

    async getOneOrderById(userId: string, orderId: string): Promise<IOrderItem> {
        const result = await Order.find({
            userId,
            orderItems: {
                $elemMatch: { _id: orderId }
            }
        }, {
            _id: 0,
            'orderItems.$': 1
        }).lean();

        const singleItem: IOrderItem = result[0].orderItems?.[0] || null;

        return singleItem;
    }
    async getOneOrderBySKU(sku: string, orderId: string): Promise<IOrderItem> {
        const result = await Order.find({
            orderId,
            orderItems: {
                $elemMatch: { sku }
            }
        }, {
            _id: 0,
            'orderItems.$': 1,
        }).lean();

        const singleItem: IOrderItem = result[0].orderItems?.[0] || null;

        return singleItem;
    }

    async updateOneItem(sku: string, orderId: string, status: OrderStatus): Promise<IOrderItem | null> {
        return await Order.findOneAndUpdate({
            orderId,
            "orderItems.sku": sku
        }, {
            $set: {
                "orderItems.$.itemStatus": status
            }
        }, {
            new: true
        })
    }


    async updateOrder(orderId: string, updatedData: Partial<IOrder>): Promise<IOrder | null> {
        return await Order.findOneAndUpdate(
            { orderId },
            { $set: { ...updatedData, updatedAt: new Date() } },
            { new: true }
        )
    }

    async getOrderByUserId(userId: string): Promise<IOrder[] | null> {
        return await Order.find({ userId })
    }

    async getOrderDetails(userId: string, orderId: string): Promise<IOrder | null> {
        return await Order.findOne({ userId, orderId })
    }

    async cancelOrderById(id: string): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(
            id,
            {
                status: "cancelled",
                updatedAt: new Date()
            },
            { new: true }
        );
    }

    async getAllOrderByUser(userId: string, skip: number, limit: number, query: any): Promise<PaginationResponse<IOrder> | null> {
        const [orders, total] = await Promise.all([
            Order.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Order.countDocuments({ userId }),
        ])

        return { data: orders, total }
    }

    async updateOrderStatus(id: string, status: IOrder["status"]): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(
            id,
            {
                status,
                updatedAt: new Date()
            },
            { new: true }
        );
    }


    async getAllOrderByVendor(vendorId: string, skip: number, limit: number, query: any): Promise<PaginationResponse<IOrder> | null> {
        const pipeline: PipelineStage[] = [
            { $unwind: { path: "$orderItems" } },
            { $match: {...query,paymentStatus:{$ne:OrderPaymentStatus.FAILED}} },
            {
                $group: {
                    _id: {
                        orderId: "$orderId",
                        vendorId: "$orderItems.vendorId"
                    },
                    orderItems: { $push: "$orderItems" },
                    orderedDate: { $first: "$orderedDate" },
                    shippedDate: { $first: "$shippedDate" },
                    deliveredDate: { $first: "$deliveredDate" },
                    paymentStatus: { $first: "$paymentStatus" },
                    paymentMethod: { $first: "$paymentMethod" },
                    shippingAddress: { $first: "$shippingAddress" }
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id.orderId",
                    orderItems: 1,
                    orderedDate: 1,
                    shippedDate: 1,
                    deliveredDate: 1,
                    paymentStatus: 1,
                    paymentMethod: 1,
                    shippingAddress:1,
                }
            },
            { $sort: { orderedDate: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const getAllOrderByVendor = await Order.aggregate(pipeline);

        const countPipeline: PipelineStage[] = [
            { $unwind: { path: "$orderItems" } },
            { $match: query },
            {
                $group: {
                    _id: {
                        orderId: "$orderId",
                        vendorId: "$orderItems.vendorId"
                    }
                }
            },
            { $count: "total" }
        ];

        const countResult = await Order.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        return { data: getAllOrderByVendor, total };
    }
}
