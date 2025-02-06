import { Document, Types } from "mongoose";


export interface ICategory extends Document {
    _id: string;
    description: string;
    subCategory: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    name: string;
}