export interface IUser {
    _id: string;
    email: string;
    password: string;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    avatar?: string;
    username: string;
    addressId: string;
    cartId: string;
    walletId: string;
    orderId: string;
    wishlistId: string;
    paymentId: string;
}