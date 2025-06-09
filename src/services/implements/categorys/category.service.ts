import { inject, injectable } from "inversify";
import { ICategoryServies } from "./ICategory.service";
import { ICategoryRepository } from "@/repository/category/interface/ICategory.interface";
import { ICategory } from "@/interface/category.interface";
import { CATEGORY, PaginationResponse } from "@/types";
import { Types } from "mongoose";
import { ErrorMessages } from "@/constants/error.constant";
import { handleAsync } from "@/utils/error-handler";

@injectable()
export class CategoryServices implements ICategoryServies {
    constructor(
        @inject(CATEGORY.categoryRepository)
        private readonly categoryRepository: ICategoryRepository
    ) { }

    async getCategorys({
        page,
        limit,
        isBlocked,
        minPrice,
        maxPrice,
        sortBy,
        search,
    }: {
        page: number;
        limit: number;
        isBlocked: boolean;
        isAdmin: boolean;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        search?: string;
    }): Promise<PaginationResponse<ICategory>> {
        return handleAsync(async () => {
            const query: any = {};

            if (minPrice !== undefined) query.price = { $gte: minPrice };
            if (maxPrice !== undefined) query.price = { ...query.price, $lte: maxPrice };

            if (search && search.trim().length > 0) {
                const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = { $regex: cleanSearch, $options: "i" };

                query.$or = [
                    { name: regex },
                    { subCategory: regex }
                ];
            }

            if (isBlocked !== undefined) {
                query.isBlocked = isBlocked;
            }

            const sort: any = {};
            if (sortBy) {
                sort[sortBy] = 1;
            } else {
                sort.createdAt = -1;
            }

            const skip = (page - 1) * limit;
            const products = await this.categoryRepository.findAllCategory(query, sort, limit, skip);

            return products;
        })
    }

    async removeSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory> {
        return handleAsync(async () => {
            const category = await this.validateSubCategoryOperation(categoryId, subCategoryId);

            if (!category.subCategory?.includes(new Types.ObjectId(subCategoryId))) {
                throw new Error(ErrorMessages.CATEGORY_CANNOT_BE_OWN_SUBCATEGORY);
            }

            const updated = await this.categoryRepository.removeSubCategory(categoryId, subCategoryId);
            if (!updated) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_REMOVE_SUBCATEGORY);
            }

            return updated;
        })
    }

    async addSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory> {
        return handleAsync(async () => {
            const category = await this.validateSubCategoryOperation(categoryId, subCategoryId);

            if (category.subCategory?.includes(new Types.ObjectId(subCategoryId))) {
                throw new Error(ErrorMessages.CATEGORY_CANNOT_BE_OWN_SUBCATEGORY);
            }

            const updated = await this.categoryRepository.addSubCategory(categoryId, subCategoryId);
            if (!updated) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_ADD_SUBCATEGORY);
            }

            return updated;
        })
    }

    async unBlockCategory(id: string): Promise<ICategory> {
        return handleAsync(async () => {
            const category = await this.validateCategoryExists(id);

            if (!category?.isBlocked) {
                throw new Error(ErrorMessages.CATEGORY_NOT_BLOCKED);
            }

            const unblocked = await this.categoryRepository.unBlockCategory(id);
            if (!unblocked) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_UNBLOCK);
            }

            return unblocked;
        })
    }

    async blockCategory(id: string): Promise<ICategory> {
        return handleAsync(async () => {
            const category = await this.validateCategoryExists(id);

            if (category?.isBlocked) {
                throw new Error(ErrorMessages.CATEGORY_BLOCKED_ALREADY);
            }

            const blocked = await this.categoryRepository.blockCategory(id);
            if (!blocked) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_BLOCK);
            }

            return blocked;
        })
    }

    async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
        return handleAsync(async () => {
            await this.validateCategoryExists(id);

            if (data.name) {
                this.validateCategoryName(data.name);
                await this.validateDuplicateCategory(data.name, id);
            }

            const updateData: Partial<ICategory> = {
                ...data,
                updatedAt: new Date()
            };

            const updated = await this.categoryRepository.update(id, updateData);
            if (!updated) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_UPDATE);
            }
            return updated;
        })
    }

    async getCategoryById(id: string): Promise<ICategory> {
        return handleAsync(async () => await this.validateCategoryExists(id) as ICategory)
    }

    async getAllCategories(): Promise<ICategory[]> {
        return handleAsync(async () => {
            const result = await this.categoryRepository.findAll();
            if (!result) {
                throw new Error(ErrorMessages.CATEGORY_FAILED_TO_FETCH);
            }

            return result;
        })
    }

    async createCategory(data: Partial<ICategory>): Promise<ICategory | null> {
        return handleAsync(async () => {
            if (!data.name || data.name.trim() === "") {
                throw new Error(ErrorMessages.CATEGORY_NAME_EMPTY);
            }

            data.name = data.name.trimEnd();

            this.validateCategoryName(data.name!);
            await this.validateDuplicateCategory(data.name!);

            return await this.categoryRepository.create(data);
        })
    }

    private async validateSubCategoryOperation(categoryId: string, subCategoryId: string): Promise<ICategory> {
        if (!categoryId || !subCategoryId) {
            throw new Error(ErrorMessages.CATEGORY_ID_AND_SUBCATEGORY_ID_REQUIRED);
        }

        const [category, subCategory] = await Promise.all([
            this.validateCategoryExists(categoryId),
            this.validateCategoryExists(subCategoryId)
        ]);

        if (categoryId === subCategoryId) {
            throw new Error(ErrorMessages.CATEGORY_CANNOT_BE_OWN_SUBCATEGORY);
        }

        return category as ICategory;
    }

    private async validateDuplicateCategory(name: string, excludeId?: string): Promise<void> {
        const existingCategories = await this.categoryRepository.findAll();
        const isDuplicate = existingCategories?.some(category =>
            category.name.toLowerCase() === name.toLowerCase() &&
            (!excludeId || category.id !== excludeId)
        );

        if (isDuplicate) {
            throw new Error(ErrorMessages.CATEGORY_ALREADY_EXISTS);
        }
    }

    private async validateCategoryExists(id: string, throwIfNotFound: boolean = true): Promise<ICategory | null> {
        if (!id) {
            throw new Error(ErrorMessages.CATEGORY_ID_REQUIRED);
        }

        const category = await this.categoryRepository.findById(id);
        if (!category && throwIfNotFound) {
            throw new Error(ErrorMessages.CATEGORY_NOT_FOUND);
        }
        return category;
    }

    private validateCategoryName(name: string): void {
        if (!name || typeof name !== 'string') {
            throw new Error(ErrorMessages.CATEGORY_NAME_INVALID);
        }
        if (name.trim().length < 3) {
            throw new Error(ErrorMessages.CATEGORY_NAME_TOO_SHORT);
        }
    }
}
