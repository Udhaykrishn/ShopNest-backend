import { PaginationResponse } from "@/types";

export interface IWishlistRepository<T>{
    createWishlist(userId: string): Promise<T | null>;
    findWishlistByUserId(userId: string,skip:number,limit:number): Promise<PaginationResponse<T> | null>;
    findItembyProductId(userId:string,productId:string):Promise<T | null>
    addToWishlist(userId: string, productId: string): Promise<T | null>;
    removeFromWishlist(userId: string, productId: string): Promise<T | null>;
}
