import { ICart } from '@/interface';
import { Schema, model } from 'mongoose';



const CartSchema = new Schema<ICart>({
    totalAmount: {
        type: Number,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            image: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            subTotal: {
                type: Number,
                required: true,
            },
            sku: {
                type: String,
                required: true,
            }
        },
    ],
});

export const Cart = model<ICart>('Cart', CartSchema);
