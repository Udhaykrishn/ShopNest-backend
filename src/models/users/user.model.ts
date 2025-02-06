import mongoose, { Schema } from "mongoose";
import { IUser } from "./interface";

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trime: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    username: {
        type: String,
        required: true,
        trime: true
    },
    avatar: {
        type: String,
        default: null,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: "Order"
    }],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Wishlist'
    }],
    payments: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    addresses: [{
        type: Schema.Types.ObjectId,
        ref: 'Address'
    }],
    wallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    }
}, { timestamps: true })

UserSchema.index({ email: 1 }, { unique: true }),
    UserSchema.index({ username: 1 })

UserSchema.pre("save", async function (next) {
    const vendor = this as IUser;

    if (!vendor.isModified("password")) return next(); // Only hash if password is modified


    this.password = this.password // replace with password hashing method
    try {

        next();
    } catch (error: any) {
        return next(error);
    }
});

const User = mongoose.model<IUser>("Users", UserSchema)
export default User
