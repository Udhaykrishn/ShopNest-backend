import { CreateProductDTO } from "@/dtos/vendor/product.dto";
import { ApprovalStatus, IProduct } from "@/interface/product.interface";
import { PaginationResponse } from "@/types";

type getProductsProps = {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    search?: string;
    status?: ApprovalStatus;
    subcategory?: string;
}

type getProductCategoryProps = {
    page: number;
    limit: number;
    category: string;
    search: string;
    subcategory: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
}

export interface IProductsService {
    getProductById(id: string): Promise<IProduct>
    getProductByCategory({ page, limit, category, search, subcategory, minPrice, maxPrice, sortBy }: getProductCategoryProps): Promise<PaginationResponse<IProduct>>
    approve(id: string): Promise<IProduct | null>
    reject(id: string): Promise<IProduct | null>
    getAllProducts(data: getProductsProps): Promise<PaginationResponse<IProduct>>
    createProduct(id: string, data: CreateProductDTO): Promise<IProduct>
    updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct>
    blockProduct(id: string): Promise<IProduct>
    unblockProduct(id: string): Promise<IProduct>
    getProductByVendor(id: string): Promise<IProduct[]>
    stockCheck(id: string, sku: string, action: "add" | "reduce", quantity: number): Promise<number>
}