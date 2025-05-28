import { IProduct } from "@/models/vendors/interface";
import { Types } from "mongoose";

export interface IWishlistItem {
    productId: Types.ObjectId | IProduct;
}

export interface IWishlist {
    userId: string;
    products: IWishlistItem[];
    createdAt?: Date;
    updatedAt?: Date;
}