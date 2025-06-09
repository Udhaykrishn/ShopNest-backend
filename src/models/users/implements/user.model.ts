import mongoose, { Schema } from "mongoose";
import { IUser } from "../interface";
import { passwordToBeHash } from "@/utils";


export interface UserDocument extends IUser,Document {}

const UserSchema = new Schema<UserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        googleId: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        phone: {
            type: String,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        isVerified: {
            type: Boolean
        },
        avatar: {
            type: String,
            default: null,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        orders: [{ type: String, ref: "Order" }],
        wishlist: { type: String, ref: "Wishlist" },
        payments: [{ type: String, ref: "Payment" }],
        addresses: [{ type: String, ref: "Address" }],
        wallet: { type: String, ref: "Wallet" },
        cartId: { type: String, ref: "Cart" },
        role: {
            type: String,
            default: "user",
        },
    },
    { timestamps: true }
);

UserSchema.index({ username: 1 });

UserSchema.pre("save", async function (next) {  
    if (!this.isModified("password")) return next();


    this.password = await passwordToBeHash(this.password);

    try {
        next();
    } catch (error: any) {
        return next(error);
    }
});

export const User = mongoose.model<UserDocument>("Users", UserSchema);
