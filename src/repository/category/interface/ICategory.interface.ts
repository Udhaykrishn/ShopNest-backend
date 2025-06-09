import { ICategory } from "@/interface/category.interface";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from "@/types";

export interface ICategoryRepository extends IBaseRepository<ICategory> {
    findAllCategory(query: Record<string, unknown>, sort: number, limit: number, skip: number): Promise<PaginationResponse<ICategory>>
    blockCategory(id: string): Promise<ICategory | null>;
    unBlockCategory(id: string): Promise<ICategory | null>;
    addSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>;
    removeSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>;
    bulkUpdate(query:any):Promise<void>
}