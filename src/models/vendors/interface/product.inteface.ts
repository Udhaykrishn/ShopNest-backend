import { Document, Types } from "mongoose";

export interface IProduct extends Document {
    _id: string;
    name: string;
    brand: string;
    images: [Types.ObjectId];
    description: string;
    vendorId: Types.ObjectId;
    variants: Types.ObjectId[]
}