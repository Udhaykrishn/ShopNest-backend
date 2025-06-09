import { IVariant, IVariantValue } from "@/models/vendors/interface";

export interface IVariantRepository {
    create(data: IVariant): Promise<IVariant>
    update(id: string, data: Partial<IVariantValue>): Promise<IVariant | null>
    findVariant(data: string): Promise<IVariant | null>
    updateBySKU(sku: string, data: Partial<IVariantValue>): Promise<IVariant | null>
    updateStockCount(sku: string, quantity:number): Promise<IVariant | null>
}