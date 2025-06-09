import { IVendorWallet } from "@/interface/wallet/vendor-wallet.interface";
import { IVendorWalletRepository } from "@/repository/wallet/interface";
import { IVendorWalletService } from "@/services/interface/wallet";
import { WALLET } from "@/types";
import { errorResponse } from "@/utils";
import { inject, injectable } from "inversify";

@injectable()
export class VendorWalletService implements IVendorWalletService {
    constructor(
        @inject(WALLET.VendorWalletRepository) private readonly vendorWalletRepository: IVendorWalletRepository
    ) { }

    async getWalletByVendorId(vendorId: string, page: number, limit: number): Promise<{ data: IVendorWallet, total: number }> {
        try {
            const skip = (page - 1) * limit;
            let walletByVendor = await this.vendorWalletRepository.getWalletByVendorId(vendorId, skip, limit)

            if (!walletByVendor) {
                const createWallet = await this.vendorWalletRepository.create(vendorId);
                walletByVendor = {
                    data: createWallet,
                    total: 1
                }
            }

            return walletByVendor;
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async addToWallet(userId: string, amount: number): Promise<IVendorWallet> {
            try {
                const updatedVendorWallet = await this.vendorWalletRepository.credit(userId,amount);
    
                if(!updatedVendorWallet){
                    throw new Error("add to failed amount transaction");
                }
    
                return updatedVendorWallet;
    
            } catch (error:any) {
                throw errorResponse(error.message)
            }
        }
}