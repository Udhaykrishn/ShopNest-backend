import mongoose, { Schema } from 'mongoose';
import { IAdmin } from './interface/admin.interface';


const adminSchema = new Schema<IAdmin>({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        trime: true
    },
    categorys: [
        { type: Schema.Types.ObjectId, ref: "Categorys" }
    ],
    coupons: [
        {
            type: Schema.Types.ObjectId,
            ref: "Coupons"
        }
    ],
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    }
},
    { timestamps: true })

    export const Admin =  mongoose.model<IAdmin>("Admin",adminSchema)
