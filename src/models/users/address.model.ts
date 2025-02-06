import { IAddress } from "./interface";
import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema<IAddress>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    state: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        trim: true,
        required: true
    },
    district: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export const Address = mongoose.model<IAddress>("Address", addressSchema) 