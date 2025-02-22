import { inject } from "inversify";
import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "@/utils";
import { ICategoryServies } from "@/services/categorys/ICategory.service";


@controller("/categorys")
export class CategorysController {
    constructor(@inject("CategorysServie") private categoryService: ICategoryServies) { }

    @httpGet("/")
    async getProducts(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 10,
                minPrice,
                maxPrice,
                sortBy = "createdAt",
                search
            } = req.query;

            const categorys = await this.categoryService.getCategorys({
                page: Number(page),
                limit: Number(limit),
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: String(sortBy),
                search: search ? String(search) : undefined
            });

            return res.status(200).json(successResponse(categorys))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }
}
