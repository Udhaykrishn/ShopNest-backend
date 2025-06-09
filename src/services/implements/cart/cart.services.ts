import {
    STOCK_DECREASE_ACTION,
    STOCK_DECREASE_COUNT,
    STOCK_INCREASE_ACTION,
    STOCK_INCREASE_COUNT,
    STOCK_MAX_LIMIT_PER_ORDER,
    STOCK_MIN_LIMIT_PER_ORDER
} from "@/constants/stock.constant";
import { ICart } from "@/interface";
import { Cart } from "@/models/users/implements/cart.model";
import { ICartRepository } from "@/repository/cart/interface/ICart.interfac";
import { IProductsRepository } from "@/repository/products/interface/product.repo.interface";
import { IUserRepository } from "@/repository/users/interface/user.interface";
import { IVariantRepository } from "@/repository/vendor/interface";
import { ICartService } from "@/services/interface";
import { CATEGORY, PRODUCT, USER, VARIANT } from "@/types";
import { CART } from "@/types/cart";
import { inject, injectable } from "inversify";
import { CategoryRepository } from '@/repository/category/implement/category.repository';
import mongoose from "mongoose";



@injectable()
export class CartServices implements ICartService<ICart> {
    constructor(
        @inject(CART.cartRepository) private readonly cartRepoitory: ICartRepository<ICart>,
        @inject(USER.UserRepository) private readonly userRepository: IUserRepository,
        @inject(PRODUCT.ProductRepository) private readonly productRepository: IProductsRepository,
        @inject(VARIANT.VariantRepository) private readonly variantRepository: IVariantRepository,
        @inject(CATEGORY.categoryRepository) private readonly categoryRepository: CategoryRepository
    ) { }

    CART_lIMIT_PER_USER = STOCK_MAX_LIMIT_PER_ORDER;

    private async getOrThrow<T>(fetchFn: () => Promise<T | null>, errorMessage: string): Promise<T> {
        const data = await fetchFn();
        if (!data) throw new Error(errorMessage);
        return data;
    }

    private async getUserAndCart(userId: string) {
        const user = await this.getOrThrow(
            () => this.userRepository.getUserById(userId),
            "User not found"
        );
        let cart = await this.cartRepoitory.getAllCartById(user.cartId as string);
        if (!cart) {
            const newCart = new Cart({ items: [], userId: user._id.toString(), totalAmount: 0 });
            cart = await this.cartRepoitory.createCart(newCart);
            await this.userRepository.update(user._id, { cartId: cart._id.toString() });
        }
        return { user, cart };
    }

    async createCart(email: string): Promise<ICart> {
        const user = await this.getOrThrow(
            () => this.userRepository.getUserByEmail(email),
            "User not found"
        );
        const newCart = new Cart({ items: [], userId: user._id.toString(), totalAmount: 0 });
        const cart = await this.cartRepoitory.createCart(newCart);
        await this.userRepository.update(user._id, { cartId: cart._id.toString() });
        return cart;
    }

    async getAllCartById(id: string): Promise<ICart> {
        const { cart } = await this.getUserAndCart(id);
        return cart;
    }

    async deleteCartById(id: string, sku: string): Promise<ICart> {
        const { cart } = await this.getUserAndCart(id);
        const item = cart.items.find((item: { sku: string; subTotal: number }) => item.sku === sku);
        if (!item) throw new Error("Item not found in cart");

        await this.cartRepoitory.updateCart(cart._id.toString(), {
            totalAmount: cart.totalAmount - item.subTotal
        });
        const updatedCart = await this.cartRepoitory.deleteCartById(cart._id.toString(), sku);
        if (!updatedCart) throw new Error("Failed to remove item from cart");

        return updatedCart;
    }

    async addToCart(id: string, productId: string, sku: string, quantity: number): Promise<ICart> {
        const { cart } = await this.getUserAndCart(id);

        if (cart.items.length >= this.CART_lIMIT_PER_USER) {
            throw new Error("Cart can hold only 5 items");
        }

        const product = await this.getOrThrow(
            () => this.productRepository.getProductById(productId),
            "Product not found"
        );

        if (product.isBlocked || (await this.categoryRepository.findOne({ name: product.category }))?.isBlocked) {
            throw new Error("Product unavailable");
        }

        const variant = await this.getOrThrow(
            () => this.variantRepository.findVariant(sku),
            "Variant not found"
        );
        if (product._id.toString() !== variant.productId) {
            throw new Error("Variant not available for this product");
        }

        const variantWithPrice = variant.values.find((value) => value.sku === sku);
        if (!variantWithPrice) throw new Error("Variant price not found");
        if (quantity > variantWithPrice.stock) throw new Error("Stock limit exceeded");

        const cartItems = {
            productId: product._id.toString(),
            subTotal: variantWithPrice.offeredPrice * quantity,
            sku,
            quantity,
            image: product.images[0]
        };

        const updatedCart = await this.cartRepoitory.addToCartItems(cart._id.toString(), cartItems);
        if (!updatedCart) throw new Error("Product already in cart");

        const totalAmount = updatedCart.items.reduce((acc, data) => data.subTotal + acc, 0);
        return this.cartRepoitory.updateCart(updatedCart._id.toString(), { totalAmount }) as Promise<ICart>;
    }

    async checkStock(id: string, sku: string, action: string, quantity: number): Promise<ICart> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { cart } = await this.getUserAndCart(id);
            const item = cart.items.find((item: { sku: string; quantity: number; subTotal: number; productId: string }) => item.sku === sku);
            if (!item) throw new Error("Item not found in cart");

            const product = await this.productRepository.findProductById(item.productId);
            if (product?.isBlocked) throw new Error("Product unavailable");

            const variant = await this.getOrThrow(
                () => this.variantRepository.findVariant(sku),
                "Variant not found"
            );
            const variantWithPrice = variant.values.find(value => value.sku === sku);
            if (!variantWithPrice) throw new Error("Variant price not found");

            const newQuantity = action === STOCK_INCREASE_ACTION
                ? item.quantity + STOCK_INCREASE_COUNT
                : quantity - STOCK_DECREASE_COUNT;

            // if (action === STOCK_DECREASE_ACTION && quantity >= variantWithPrice.stock) throw new Error(`Stock exceeds available at: ${variantWithPrice.stock}`);
            if (action === STOCK_INCREASE_ACTION && newQuantity > variantWithPrice.stock) throw new Error(`Stock exceeds available in: ${variantWithPrice.stock}`);
            if (newQuantity > STOCK_MAX_LIMIT_PER_ORDER) throw new Error("Exceeds maximum limit");
            if (newQuantity <= STOCK_MIN_LIMIT_PER_ORDER) throw new Error("Below minimum limit");

            const subTotal = variantWithPrice.offeredPrice * newQuantity;
            const totalAmount = cart.totalAmount - item.subTotal + subTotal;

            const updatedCart = await this.cartRepoitory.updateToCartItems(cart._id.toString(), sku, {
                quantity: newQuantity,
                subTotal,
                sku,
                productId: item.productId,
                image: product?.images[0]
            });

            if (!updatedCart) throw new Error("Failed to update cart");

            const finalCart = await this.cartRepoitory.updateCart(cart._id.toString(), { totalAmount });
            if (!finalCart) throw new Error("Failed to update cart");

            await session.commitTransaction();
            return finalCart as ICart;
        } catch (error: any) {
            await session.abortTransaction();
            throw new Error(error.message || "Failed to update cart");
        } finally {
            session.endSession();
        }
    }

    async getCartCount(id: string): Promise<number> {
        const { cart } = await this.getUserAndCart(id);
        return this.cartRepoitory.countCart(id);
    }

    async clearCart(userId: string): Promise<ICart> {
        const { user } = await this.getUserAndCart(userId);
        const updated = await this.cartRepoitory.clearCart(user._id as string);
        if (!updated) throw new Error("Failed to clear cart");
        return updated;
    }
}