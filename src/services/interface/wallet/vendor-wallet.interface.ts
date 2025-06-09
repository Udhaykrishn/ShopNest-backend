import { IVendorWallet } from "@/interface/wallet/vendor-wallet.interface";

export interface IVendorWalletService {
    getWalletByVendorId(vendorId: string, page: number, limit: number): Promise<{ data: IVendorWallet, total: number }>
    addToWallet(userId:string,amount:number):Promise<IVendorWallet>
}