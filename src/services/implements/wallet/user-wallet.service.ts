import { IUserWallet } from "@/interface/wallet/vendor-wallet.interface";
import { IUserWalletRepository } from "@/repository/wallet/interface";
import { IUserWalletService } from "@/services/interface/wallet";
import { WALLET } from "@/types";
import { errorResponse } from "@/utils";
import { inject, injectable } from "inversify";

@injectable()
export class UserWalletService implements IUserWalletService {
    constructor(
        @inject(WALLET.UserWalletRepositroy) private readonly userWalletRepository: IUserWalletRepository
    ) { }

    async getWalletByUserId(userId: string, page: number, limit: number): Promise<{ data: IUserWallet, total: number }> {
        try {
            const skip = (page - 1) * limit;
            const walletByUser = await this.userWalletRepository.getWalletByUserId(userId, skip, limit)

            if (!walletByUser) {
                const createWallet = await this.userWalletRepository.create(userId);
                return { data: createWallet, total: 1 }
            }

            return walletByUser;
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }


    async addToWallet(userId: string, amount: number): Promise<IUserWallet> {
        try {
            const updatedUserWallet = await this.userWalletRepository.credit(userId,amount);

            if(!updatedUserWallet){
                throw new Error("add to failed amount transaction");
            }

            return updatedUserWallet;

        } catch (error:any) {
            throw errorResponse(error.message)
        }
    }
}