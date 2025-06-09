import { IProduct } from "@/interface/product.interface";
import { IVariantValue } from "@/models/vendors/interface";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from "@/types";

export interface IProductsRepository extends IBaseRepository<IProduct> {
    findAllProducts(query: Record<string, unknown>, sort: number, limit: number, skip: number): Promise<PaginationResponse<IProduct>>
    findProductById(id: string): Promise<IProduct | null>
    getProductById(id?: string): Promise<IProduct | null>;
    getProductByVendor(id: string): Promise<IProduct[] | null>
    findProductBySKU(sku: string): Promise<IProduct | null>
    findProductWithSKU(sku: string): Promise<IVariantValue | null>
    findProductsByCategory(query: Record<string, unknown>, sort: any, limit: number, skip: number): Promise<PaginationResponse<IProduct>>
}