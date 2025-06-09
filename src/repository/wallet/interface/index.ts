import { IUserWallet, IVendorWallet } from "@/interface/wallet/vendor-wallet.interface";

export interface IVendorWalletRepository {
    debet(vendorId: string, amount: number): Promise<IVendorWallet | null>
    credit(vendorId: string, amount: number): Promise<IVendorWallet | null>
    create(vendorId: string): Promise<IVendorWallet>
    getWalletByVendorId(vendorId: string, skip: number, limit: number): Promise<{ data: IVendorWallet, total: number } | null>
}

export interface IUserWalletRepository {
    debet(userId: string, amount: number): Promise<IUserWallet | null>
    credit(userId: string, amount: number): Promise<IUserWallet | null>
    create(userId: string): Promise<IUserWallet>
    getWalletByUserId(userId: string, skip: number, limit: number): Promise<{ data: IUserWallet, total: number } | null>
}