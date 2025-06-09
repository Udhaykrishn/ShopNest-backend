export interface ICartService<T> {
    getAllCartById(id: string): Promise<T | null>;
    deleteCartById(id: string, sku: string): Promise<T>
    addToCart(id: string, productId: string, sku: string, quantity: number): Promise<T>
    createCart(email: string): Promise<T>
    getCartCount(id: string): Promise<number>
    checkStock(id: string, sku: string, action: string,quantity:number): Promise<T>
    clearCart(userId:string): Promise<T>
}