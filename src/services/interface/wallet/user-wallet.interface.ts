import { IUserWallet } from "@/interface/wallet/vendor-wallet.interface"

export interface IUserWalletService {
    getWalletByUserId(userId: string, page: number, limit: number): Promise<{ data: IUserWallet, total: number }>
    addToWallet(userId:string,amount:number):Promise<IUserWallet>
}