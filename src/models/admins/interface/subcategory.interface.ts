import { Document, Types } from "mongoose"

export interface ISubCategory extends Document {
    name: string;
    isActive: boolean;
    cateogryId?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}