import mongoose,{ Schema } from "mongoose";
import { IWishlist } from "@/interface";

const WishlistSchema = new Schema<IWishlist>(
    {
        userId: {
            type: String,
            required: true,
            ref: "Users",
            unique: true,
        },
        products: [{
            productId: {
                type: String,
                ref: "Product"
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        _id:false,
    }
);

WishlistSchema.index({ userId: 1 });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);