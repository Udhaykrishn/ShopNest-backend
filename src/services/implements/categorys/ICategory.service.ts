import { ICategory } from "@/interface/category.interface";
import { PaginationResponse } from "@/types";

type getCategoryProps = {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    search?: string;
    isBlocked: boolean
}

export interface ICategoryServies {
    getCategorys(props: getCategoryProps): Promise<PaginationResponse<ICategory>>
    createCategory(data: Partial<ICategory>): Promise<ICategory | null>;
    getAllCategories(): Promise<ICategory[]>;
    getCategoryById(id: string): Promise<ICategory | null>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    blockCategory(id: string): Promise<ICategory | null>
    unBlockCategory(id: string): Promise<ICategory | null>
    addSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>;
    removeSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>
}