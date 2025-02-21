import mongoose, { Schema } from "mongoose";
import { ICategory } from "./interface";

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        minlength: 3,
        required: true,
        trim: true,
    },
    subCategory: [],
    description: {
        type: String,
        minlength: 5,
        trim: true
    },
    isBlocked: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })

export const Category = mongoose.model<ICategory>("Category", categorySchema)