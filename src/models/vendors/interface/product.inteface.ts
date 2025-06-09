import { Document, Types } from "mongoose";
import { IVariant } from "./varients.interface";

export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    brand: string;
    description: string;
    images: string[];
    vendorId: Types.ObjectId;
    categoryId: string;
    variants: IVariant[];
    price: number;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
