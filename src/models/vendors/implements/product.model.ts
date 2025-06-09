import mongoose, { Schema } from "mongoose";
import { ApprovalStatus, IProduct } from "@/interface/product.interface";
import { Types } from "mongoose";


export interface ProductDoucment extends IProduct {}

const productSchema = new Schema<ProductDoucment>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: Object.values(ApprovalStatus),
        default: ApprovalStatus.PENDING,
    },
    images: [{
        type: String,
        required: true,
    }],
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor"
    },
    category: {
        type: String,
        ref: "Category"
    },
    subcategory: {
        type: String,
        required: true
    },
    variants: [{ type: Types.ObjectId, ref: "Variant" }],
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

export const Product = mongoose.model<ProductDoucment>("Product", productSchema);