import { Document } from "mongoose";

export interface ICoupon extends Document {
    name: string;
    createdOn: Date,
    expireOn: Date,
    offerPrice: number;
    min_price: number,
    isBlocked: boolean,
    userId: string;
    isExpired?: boolean;
}

export interface ICouponUsage extends Document{
    userId:string;
    name:string;
    usedAt:Date;
}