import { injectable } from "inversify"
import { Variant } from "@/models/vendors/implements"
import { IVariantRepository } from "../interface"
import { IVariant, IVariantValue } from "@/models/vendors/interface"


@injectable()
export class VariantRepository implements IVariantRepository {
    async create(data: IVariant): Promise<IVariant> {
        const variant = new Variant(data);
        return await variant.save();
    }

    async update(id: string, data: Partial<IVariantValue>): Promise<IVariant | null> {
        return await Variant.findByIdAndUpdate(id, data, { new: true })
    }

    async updateBySKU(sku: string, data: Partial<IVariantValue>): Promise<IVariant | null> {
        return await Variant.findOneAndUpdate({ sku }, data, { new: true })
    }

    async findVariant(sku: string): Promise<IVariant | null> {
        return await Variant.findOne({ "values.sku": sku })
    }

    async updateStockCount(sku: string, quantity: number): Promise<IVariant | null> {
        if (quantity < 0) {
            return await Variant.findOneAndUpdate(
                {
                    "values": {
                        $elemMatch: {
                            sku: sku,
                            stock: { $gte: Math.abs(quantity), $gt: 0 }
                        }
                    }
                },
                {
                    $inc: { "values.$.stock": quantity }
                },
                { new: true }
            );
        } else {
            return await Variant.findOneAndUpdate(
                { "values.sku": sku },
                {
                    $inc: { "values.$.stock": quantity }
                },
                { new: true }
            );
        }
    }


}