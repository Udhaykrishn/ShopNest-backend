import mongoose, { Schema } from "mongoose";
import { IVariant } from "../interface";
import { IVariantValue } from "../interface";

const variantValueSchema = new Schema<IVariantValue>({
    value: {
        type: String,
        required: [true, "Variant value is required"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    offeredPrice: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock cannot be negative"],
    },
    sku: {
        type: String,
        trim: true,
    },
});

const variantSchema = new Schema<IVariant>({
    type: {
        type: String,
        required: [true, "Variant type is required"],
        trim: true,
    },
    values: {
        type: [variantValueSchema],
        required: [true, "At least one variant value is required"],
        validate: {
            validator: (arr: IVariantValue[]) => arr.length > 0,
            message: "At least one variant value is required",
        },
    },
    productId: {
        type: String,
        ref: "Product",
        required: [true, "Product ID is required"],
        index: true,
    },
}, {
    timestamps: true,
});

export const Variant = mongoose.model<IVariant>("Variant", variantSchema);