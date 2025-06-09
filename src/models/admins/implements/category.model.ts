import mongoose, { Schema } from "mongoose";
import { ICategory } from "@/interface/category.interface";

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        minlength: 3,
        required: true,
        trim: true,
    },
    subCategory: [],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    offer:{
        type:Number,
        deafult:0,
    }
}, { timestamps: true })

export const Category = mongoose.model<ICategory>("Category", categorySchema)