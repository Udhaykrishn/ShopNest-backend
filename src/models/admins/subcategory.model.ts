import mongoose, { Schema, Types } from "mongoose";
import { ISubCategory } from "./interface";

const subCategorySchema = new Schema<ISubCategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        unique: true,
    },
    cateogryId: {
        type: Types.ObjectId,
        ref: "Category",
    },
    isBlock: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model<ISubCategory>("SubCategory", subCategorySchema);