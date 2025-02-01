import { Document } from "mongoose";

export interface IAddress extends Document {
    userId: string;
    state: string
    street: string;
    pincode: number;
    updateAt: Date
    createdAt: Date
    name: string;
    district: string;
    phone: string
}