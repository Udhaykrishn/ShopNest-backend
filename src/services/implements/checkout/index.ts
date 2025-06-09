import { inject, injectable } from "inversify";
import { ICheckoutService } from "@/services/interface/checkout";
import { CATEGORY, PRODUCT, VARIANT } from "@/types";
import { IProductsRepository } from "@/repository/products/interface/product.repo.interface";
import { IVariantRepository } from "@/repository/vendor/interface";
import { ICategoryRepository } from "@/repository/category/interface/ICategory.interface";
import { CART } from "@/types/cart";
import { ICartRepository } from "@/repository/cart/interface/ICart.interfac";
import { Cart } from "@/interface/cart/cart.interface";
import { errorResponse } from "@/utils";

@injectable()
export class CheckoutService implements ICheckoutService {

    constructor(
        @inject(PRODUCT.ProductRepository) private readonly productRepository: IProductsRepository,
        @inject(VARIANT.VariantRepository) private readonly variantRepository: IVariantRepository,
        @inject(CATEGORY.categoryRepository) private readonly categoryRepository: ICategoryRepository,
        @inject(CART.cartRepository) private readonly cartRepository: ICartRepository<Cart>
    ) { }

    private async getCart(userId: string) {
        const cart = await this.cartRepository.getAllCartByUserId(userId)
        if (!cart) {
            throw new Error("Cart not found")
        }
        return cart;
    }

    async getCheckout(userId: string, data: any): Promise<any> {
        try {
            const cart = await this.getCart(userId);

            const products = cart.items.map((data: any) => data.productId.toString());

            await Promise.all(products.map(async (productId) => {
                const product = await this.productRepository.getProductById(productId);
                if (!product) {
                    throw new Error("Product not found");
                }
                if (product?.isBlocked) {
                    throw new Error(`Product ${product.name} no longer available or Out of stock - remove to proceed to checkout`);
                }

                const category = await this.categoryRepository.findOne({name:product.category});
                if (!category) {
                    throw new Error("Category not found");
                }
                if (category.isBlocked) {
                    throw new Error(`Product ${product.name} no longer available or Out of stock - remove to proceed to checkout`);
                }
            }));

            const skuWithProduct = cart.items.map((data: any) => data.sku);

            await Promise.all(skuWithProduct.map(async (sku) => {
                const variant = await this.variantRepository.findVariant(sku);
                if (!variant) {
                    throw new Error("Variant not found");
                }

                const getStockWithCurrentProduct = variant.values.find((items) => items.sku === sku);
                if (!getStockWithCurrentProduct) {
                    throw new Error("Current product stock can't be found");
                }

                const currentQuantity = cart.items.find((quantity) => quantity.sku === getStockWithCurrentProduct?.sku)?.quantity;
                if (!currentQuantity) {
                    throw new Error("Quantity can't be found");
                }

                if (currentQuantity > getStockWithCurrentProduct?.stock) {
                    throw new Error("Stock limit exceeded");
                }
            }));

            return "oke";
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

}