import { ICategory } from '@/interface/category.interface';

export interface ICategoryService {
    createCategory(data: Partial<ICategory>): Promise<ICategory | null>;
    getAllCategories(): Promise<ICategory[]>;
    getCategoryById(id: string): Promise<ICategory | null>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    blockCategory(id: string): Promise<ICategory | null>
    unBlockCategory(id: string): Promise<ICategory | null>
    addSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>;
    removeSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null>;
}
