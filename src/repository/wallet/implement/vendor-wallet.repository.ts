import { injectable } from "inversify";
import { IVendorWalletRepository } from "../interface";
import { IVendorWallet, paymentType } from "@/interface/wallet/vendor-wallet.interface";
import { VendorWallet } from "@/models/vendors/implements/wallet.model"

@injectable()
export class VendorWalletRepository implements IVendorWalletRepository {

    async getWalletByVendorId(vendorId: string, skip: number, limit: number): Promise<{ data: IVendorWallet, total: number } | null> {
        const wallet = await VendorWallet.findOne(
            { vendorId },

            {
                transactions: { $slice: [{ $reverseArray: "$transactions" }, skip, limit] },
                balance: 1,
                vendorId: 1
            }
        ).lean();

        if (!wallet) {
            return null;
        }

        const totalCount = await VendorWallet.aggregate([
            { $match: { vendorId } },
            { $project: { totalCount: { $size: "$transactions" } } }
        ]);

        const total = totalCount[0]?.totalCount || 0;

        return {
            data: wallet,
            total,
        }
    }

    async create(vendorId: string): Promise<IVendorWallet> {
        return await VendorWallet.create({ vendorId });
    }


    async credit(vendorId: string, amount: number): Promise<IVendorWallet | null> {
        return await VendorWallet.findOneAndUpdate({ vendorId }, {
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
                vendorId
            }
        }, { new: true, upsert: true, setDefaultsOnInsert: true })
    }

    async debet(vendorId: string, amount: number): Promise<IVendorWallet | null> {
        return await VendorWallet.findOneAndUpdate({
            vendorId
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

    async history(vendorId: string): Promise<IVendorWallet | null> {
        return await VendorWallet.findOne({ vendorId }, { transactions: 1, _id: 0 })
    }
}