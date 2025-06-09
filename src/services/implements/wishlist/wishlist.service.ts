import { IWishlist } from "@/interface";
import { IProductsRepository } from "@/repository/products/interface/product.repo.interface";
import { IWishlistRepository } from "@/repository/wishlist/interface/wishlist.repository";
import { IWishlistService } from "@/services/interface";
import { PaginationResponse, PRODUCT, WISHLIST } from "@/types";
import { errorResponse, validateExists } from "@/utils";
import { inject, injectable } from "inversify";


@injectable()
export class WishlistService implements IWishlistService<IWishlist> {

    constructor(
        @inject(PRODUCT.ProductRepository) private readonly productRepository: IProductsRepository,
        @inject(WISHLIST.wishlistRepository) private readonly wishlistRepository: IWishlistRepository<IWishlist>
    ) {

    }

    private checkProductIsNotNull = async (productId: string) => {
        const product = await this.productRepository.findById(productId);

        const isProduct = validateExists(product, "Product")

        return isProduct;
    }

    private checkProductAlreadyInWishlist = async (userId: string, productId: string) => {
        const product = await this.wishlistRepository.findItembyProductId(userId, productId)

        if (product) {
            throw new Error("Product already in wishlist")
        }

    }

    async addProductToWishlist(userId: string, productId: string): Promise<IWishlist> {
        try {
            const product = await this.checkProductIsNotNull(productId);

            await this.checkProductAlreadyInWishlist(userId, product._id);

            const result = await this.wishlistRepository.addToWishlist(userId, product._id);

            if (!result) {
                throw new Error("Failed to add product in wishlist")
            }

            return result;
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async removeFromWishlist(userId: string, productId: string): Promise<IWishlist> {
        try {
            const product = await this.checkProductIsNotNull(productId)

            const checkProductInWishlist = await this.wishlistRepository.findItembyProductId(userId, product._id)

            if (!checkProductInWishlist) {
                throw new Error("Product not found in wishlist")
            }


            const deletedProduct = await this.wishlistRepository.removeFromWishlist(userId, product._id)

            if (!deletedProduct) {
                throw new Error("Failed to remove item from wishlist")
            }

            return deletedProduct;
        } catch (error: any) {
            throw errorResponse(error.message)
        }

    }

    async getWishlist(userId: string,page:number,limit:number): Promise<PaginationResponse<IWishlist> | null> {
        try {

            const skip = (page - 1) * limit;

            const wishlist = await this.wishlistRepository.findWishlistByUserId(userId,skip,limit)

            if (!wishlist) {
                throw new Error("products not found");
            }

            console.log("wishlist is: ",wishlist)

            return wishlist
        } catch (error: any) {
            throw errorResponse(error.message);
        }
    }
}