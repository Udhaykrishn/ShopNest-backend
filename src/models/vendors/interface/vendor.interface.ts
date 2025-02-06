import { Document, Types } from "mongoose"

export interface IVendor extends Document {
    username: string;
    email: string;
    phone: string;
    order: Types.ObjectId[];
    wallet: Types.ObjectId[];
    products: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    approvalStatus: "active" | "inactive",
    isApproved: boolean;
    isBlocked: boolean;
    avatar?: string | null;
    password: string;
    address: Types.ObjectId[];
}