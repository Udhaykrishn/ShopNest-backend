import { Document, Types } from "mongoose"

export interface IVendor extends Document {
    username: string;
    email: string;
    phone: string;
    order?: string[];
    wallet?: string[];
    products?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    approvalStatus?: "active" | "inactive",
    isApproved?: boolean;
    isBlocked?: boolean;
    avatar?: string | null;
    password: string;
    isRejected: boolean;
    address?: Types.ObjectId[];
    role?: "vendor",
}