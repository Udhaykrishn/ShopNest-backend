import { ICart } from "@/interface";
import { ICartRepository } from "../interface/ICart.interfac";
import { Cart } from "@/models/users/implements/cart.model";
import { CartItem } from "@/interface/cart/cart.interface";
import { injectable } from "inversify";

@injectable()
export class CartRepository implements ICartRepository<ICart> {

    async clearCart(userId: string): Promise<ICart | null> {
        return await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true })
    }

    async createCart(cart: ICart): Promise<ICart> {
        return await Cart.create(cart)
    }

    async getAllCartById(id: string): Promise<ICart | null> {
        return await Cart.findById(id)
    }

    async getAllCartByUserId(userId: string): Promise<ICart | null> {
        return await Cart.findOne({ userId })
    }

    async deleteCartById(id: string, sku: string): Promise<ICart | null> {
        return await Cart.findByIdAndUpdate(id, {
            $pull: { items: { sku } }
        }, { new: true }
        )
    }

    async addToCartItems(id: string, cartItem: Partial<CartItem>): Promise<ICart | null> {
        return await Cart.findOneAndUpdate(
            {
                _id: id,
                items: {
                    $not: { $elemMatch: { sku: cartItem.sku } }
                }
            },
            {
                $push: { items: cartItem },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );
    }

    async updateCart(id: string, cart: Partial<ICart>): Promise<ICart | null> {
        return await Cart.findByIdAndUpdate(id, cart, { new: true })
    }

    async updateToCartItems(id: string, sku: string, cartItem: Partial<CartItem>): Promise<ICart | null> {
        return await Cart.findOneAndUpdate(
            {
                _id: id,
                "items.sku": sku
            },
            {
                $set: {
                    "items.$": cartItem,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
    }

    async countCart(id: string) {
        let count = await Cart.findOne({ userId: id }, { _id: 0, items: 1 })
        return count ? count.items.length : 0;
    }
}