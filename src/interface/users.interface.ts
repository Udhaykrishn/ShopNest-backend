export interface IUser {
    _id: string;
    email: string;
    password: string;
    googleId: string;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    phone?: string;
    avatar?: string;
    username: string;
    addressId?: string;
    cartId?: string;
    walletId?: string;
    orderId?: string;
    wishlistId?: string;
    paymentId?: string;
    role:"user"
}