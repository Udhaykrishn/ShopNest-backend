export interface ICheckoutService {
    getCheckout(userId: string, data: any): Promise<any>
}