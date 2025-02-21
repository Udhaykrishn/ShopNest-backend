import { Types, Document } from "mongoose";

export interface IAdmin extends Document {
    _id: string;
    email: string;
    password: string;
    createdAt:Date;
    updatedAt:Date,
    role:"admin"
}