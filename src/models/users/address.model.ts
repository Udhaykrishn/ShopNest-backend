import { IAddress } from "@/models/users/interface/address.interface";
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
    updateAt: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    district: {
        type: String,
        required: true,
    },
})