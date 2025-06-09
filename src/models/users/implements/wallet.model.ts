import { IUserWallet, paymentType } from "@/interface/wallet/vendor-wallet.interface"
import mongoose, { Schema } from "mongoose"

const userWalletSchema = new Schema<IUserWallet>({
    userId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    transactions: [
        {
            _id: false,
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            },
            type: {
                type: String,
                enum: Object.values(paymentType),
                required: true,
            }
        }
    ]
})

export const UserWallet = mongoose.model("User-wallet", userWalletSchema)


