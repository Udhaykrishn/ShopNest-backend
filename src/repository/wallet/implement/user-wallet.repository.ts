import { injectable } from "inversify";
import { IUserWalletRepository } from "../interface";
import { IUserWallet, paymentType } from "@/interface/wallet/vendor-wallet.interface";
import { UserWallet } from "@/models/users/implements/wallet.model";

@injectable()
export class UserWalletRepository implements IUserWalletRepository {

    async getWalletByUserId(userId: string, skip: number, limit: number): Promise<{ data: IUserWallet, total: number } | null> {
        const wallet = await UserWallet.findOne(
            { userId },
            {
                transactions: { $slice: [{ $reverseArray: "$transactions" }, skip, limit] },
                balance: 1,
                userId: 1
            }
        ).lean();

        if (!wallet) {
            return null;
        }

        const totalCount = await UserWallet.aggregate([
            { $match: { userId } },
            { $project: { totalCount: { $size: "$transactions" } } }
        ]);
        const total = totalCount[0]?.totalCount || 0;
        return {
            data: wallet,
            total,
        }
    }

    async credit(userId: string, amount: number): Promise<IUserWallet | null> {
        return await UserWallet.findOneAndUpdate({ userId }, {
            $inc: {
                balance: amount,
            },
            $push: {
                transactions: {
                    amount,
                    type: paymentType.CREDIT,
                    date: new Date(),
                }
            },
            $setOnInsert: {
                userId
            }
        }, { new: true, upsert: true, setDefaultsOnInsert: true })
    }

    async create(userId: string): Promise<IUserWallet> {
        return await UserWallet.create({ userId })
    }

    async debet(userId: string, amount: number): Promise<IUserWallet | null> {
        return await UserWallet.findOneAndUpdate({
            userId
        }, {
            $inc: { balance: -amount },
            $push: {
                transactions: {
                    amount,
                    type: paymentType.DEBIT,
                    date: new Date(),
                }
            }
        }, { new: true })
    }
}