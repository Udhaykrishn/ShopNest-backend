import mongoose, { Schema } from "mongoose";
import { IOtpData } from "../interface";
import { hashOTP } from "@/utils";

const OtpSchema = new Schema<IOtpData>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    role: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: ["SIGNUP", "FORGOT_PASSWORD","CHANGE_EMAIL"]
    },
    encryptData: {
        type: String,
    },
    otpExpiry: {
        type: Date,
        required: true,
        expires: 300
    }
})

OtpSchema.pre("save", async function (next) {
    if (this.isModified("otp")) {
        this.otp = await hashOTP(this.otp)
    }
    next();
})

export const OTP = mongoose.model<IOtpData>("OTP", OtpSchema)