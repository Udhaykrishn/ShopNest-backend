import { PaginationResponse } from "@/types";

export interface IWishlistService<T> {
    getWishlist(userId: string,page:number,limit:number): Promise<PaginationResponse<T> | null>;
    addProductToWishlist(userId: string, sku: string): Promise<T>;
    removeFromWishlist(userId: string, sku: string): Promise<T>;
}

 