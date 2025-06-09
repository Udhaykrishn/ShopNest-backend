import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  googleId: string;
  password: string;
  username: string;
  phone: string;
  avatar?: string;
  isBlocked: boolean;
  orders: string[];
  wishlist: string;
  isVerified: boolean;
  payments: string[];
  addresses: string[];
  wallet: string;
  cartId: string;
  createdAt: Date;
  updatedAt: Date;
  role: "user";
  otp?: string;
  otpExpires?: Date;
}
