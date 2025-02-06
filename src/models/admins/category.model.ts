import mongoose, { Schema } from "mongoose";
import { ICategory } from "./interface";

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        minlength: 3,
        required: true,
        trim: true,
    },
    subCategory: [{
        type: Schema.Types.ObjectId,
        ref: "SubCategory"
    }],
    description: {
        type: String,
        minlength: 5,
        trim: true
    }
}, { timestamps: true })

export const Category = mongoose.model<ICategory>("Category", categorySchema)