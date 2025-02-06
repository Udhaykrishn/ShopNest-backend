import mongoose, { Schema, Types } from "mongoose";
import { ISubCategory } from "./interface";

const subCategorySchema = new Schema<ISubCategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    cateogryId: {
        type: Types.ObjectId,
        ref: "Category",
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model<ISubCategory>("SubCategory", subCategorySchema);