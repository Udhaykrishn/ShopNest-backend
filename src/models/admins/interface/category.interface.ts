import { Document, Types } from "mongoose";


export interface ICategory extends Document {
    description: string;
    subCategory: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    name: string;
    isBlocked:boolean
}