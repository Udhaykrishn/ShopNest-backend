import { Types, Document } from "mongoose"

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    avatar?: string;
    isBlocked: boolean;
    orders: Types.ObjectId[];
    wishlist: Types.ObjectId[];
    payments: Types.ObjectId[];
    addresses: Types.ObjectId[];
    wallet: Types.ObjectId;
    cart: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    role:"user",
    otp?:string;
    otpExpires?:Date;
}