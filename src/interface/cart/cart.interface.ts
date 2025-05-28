
export interface CartItem {
    productId: string;
    quantity: number;
    subTotal: number;
    image: string;
    sku: string;
}

export interface Cart extends Document {
    _id: string;
    totalAmount: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    items: CartItem[];
}