import { CartItem } from "@/interface/cart/cart.interface"

export interface ICartRepository<T> {
    createCart(cart: T): Promise<T>
    getAllCartById(id: string): Promise<T | null>
    getAllCartByUserId(userId: string): Promise<T | null>
    deleteCartById(id: string, sku: string): Promise<T | null>
    addToCartItems(id: string, cartItem: Partial<CartItem>): Promise<T | null>
    updateToCartItems(id: string, sku: string, cartItem: Partial<CartItem>): Promise<T | null>
    updateCart(id: string, cart: Partial<T>): Promise<T | null>
    countCart(id: string): Promise<number>
    clearCart(userId: string): Promise<T | null>
}