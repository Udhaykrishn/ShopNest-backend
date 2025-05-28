import { Document, Types } from "mongoose"

export interface IVendors extends Document {
    username: string;
    email: string;
    phone: string;
    order: string[];
    wallet: string[];
    products: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
    approvalStatus: "active" | "inactive",
    isApproved: boolean;
    isBlocked: boolean;
    avatar?: string | null;
    password: string;
    address: Types.ObjectId[];
    role: "vendor",
}