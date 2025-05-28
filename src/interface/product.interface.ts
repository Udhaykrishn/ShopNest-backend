import { IVariant, IVendor } from "@/models/vendors/interface";
import { Document, } from "mongoose";

export enum ApprovalStatus {
    APPROVED = "approved",
    REJECTED = "rejected",
    PENDING = "pending"
}

export interface IProduct extends Document {
    _id: string;
    name: string;
    brand: string;
    description: string;
    images: Array<string>;
    vendorId: string | IVendor;
    category: string;
    subcategory: string;
    variants: string[] | IVariant[];
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    status: ApprovalStatus;
}
