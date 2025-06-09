import mongoose, { Schema } from "mongoose";
import { IVendor } from "@/models/vendors/interface/vendor.interface";
import { passwordToBeHash } from "@/utils";


const vendorSchema = new Schema<IVendor>({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isRejected: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    approvalStatus: {
        type: String,
        default: "inactive"
    },
    order: [{
        type: Schema.Types.ObjectId,
        ref: "Order"
    }],
    wallet: [{
        type: Schema.Types.ObjectId,
        ref: "Wallet"
    }],
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date
    },
    address: [{
        type: Schema.Types.ObjectId,
        ref: "Address"
    }],
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Products",
    }],
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "vendor",
    }
})

vendorSchema.pre("save", async function (next) {
    const vendor = this as IVendor;

    if (!vendor.isModified("password")) return next();
    try {
        this.password = await passwordToBeHash(this.password)
        next();
    } catch (error: any) {
        return next(error);
    }
});

export const Vendor = mongoose.model<IVendor>("Vendor", vendorSchema)
