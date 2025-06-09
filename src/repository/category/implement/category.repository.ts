import { ICategory } from "@/interface/category.interface";
import { ICategoryRepository } from "../interface/ICategory.interface";
import { injectable } from "inversify";
import { Category } from "@/models/admins/implements";
import { Types } from "mongoose";
import { PaginationResponse } from "@/types";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
    constructor() {
        super(Category)
    }
    async findAllCategory(query: Record<string, unknown>, sort: any, limit: number, skip: number): Promise<PaginationResponse<ICategory>> {
        try {
            const total = await Category.countDocuments(query)
            const category = await Category.find(query)
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .exec();

            return {
                data: category,
                total,
            }
        } catch (error) {
            throw new Error("Failed to fetch products");
        }
    }

    async blockCategory(id: string): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(id, { isBlocked: true }, { new: true })
    }
    async unBlockCategory(id: string): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(id, { isBlocked: false }, { new: true })
    }

    async bulkUpdate(query: any): Promise<void> {
        await Category.bulkWrite(query);
    }

    async addSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(
            categoryId,
            { $addToSet: { subCategory: new Types.ObjectId(subCategoryId) } },
            { new: true }
        ).populate("subCategory")
    }

    async removeSubCategory(categoryId: string, subCategoryId: string): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(
            categoryId,
            { $pull: { subCategory: new Types.ObjectId(subCategoryId) } },
            { new: true }
        ).populate("subCategory");
    }
}