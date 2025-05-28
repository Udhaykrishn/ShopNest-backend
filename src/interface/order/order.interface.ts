import { OrderPaymentMethods, OrderPaymentStatus, ReturnOrderStatus } from "@/constants";
import { AddressItem } from "../address/address.interface";
import { Document } from "mongoose";

export interface IOrderItem extends Document{
  _id:string;
  productId: string;
  quantity: number;
  price: number;
  image?: string;
  productName: string;
  userId: string;
  sku: string;
  itemStatus: "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  vendorId: string;
  commisionAmount: number;
  payout: number;
  cancelReason?: string;

  variant?: string;

  returnStatus: ReturnOrderStatus;
  returnReason?: string;
  returnComment?: string;
  returnRequestedAt?: Date;
  returnApprovedAt?: Date;
  returnRejectedAt?: Date;
}

export interface IOrder extends Document {
  _id:string;
  userId: string;
  orderId: string;
  orderItems: IOrderItem[];

  commision: number;

  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  couponApplied: boolean;
  couponCode?: string;
  couponDiscount: number;
  shippingAddress: AddressItem;

  paymentMethod: OrderPaymentMethods;
  paymentStatus: OrderPaymentStatus;
  paymentId?: string;

  status: "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  orderedDate: Date;
  invoiceDate: Date;
  shippedDate?: Date;
  deliveredDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}
