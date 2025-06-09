import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../interface';
import { passwordToBeHash } from '@/utils';


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
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    role: {
        type: String,
        default: "admin",
    }
},
    { timestamps: true })


adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await passwordToBeHash(this.password)
        next();
    }
})

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema)
