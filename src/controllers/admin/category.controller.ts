import { inject } from "inversify";
import { controller, httpPost, httpGet, httpPut, requestParam, response, httpPatch, request } from "inversify-express-utils";
import { Request, Response } from "express";
import { CATEGORY } from "@/types";
import { ICategoryService } from "@/services/interface";
import { validateRequest } from "@/middleware/validation.middleware";
import { BlockCategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from "@/dtos/admin/category.dto";
import { AuthGuard, Role } from "@/decorators/AuthGuard";
import { errorResponse, successResponse } from "@/utils";

@controller("/admin/category")
export class CategoryController {
    constructor(@inject(CATEGORY.categoryServices) private readonly categoryService: ICategoryService) { }

    @httpPost("/", validateRequest(CreateCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async createCategory(req: Request, res: Response) {
        try {
            const category = await this.categoryService.createCategory(req.body);
            return res.status(201).json(successResponse(category))
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.message));
        }
    }

    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.getAllCategories();
            return res.status(200).json(successResponse(categories));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPut("/:id", validateRequest(UpdateCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async updateCategory(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.updateCategory(req.params.id, req.body)
            return res.status(200).json(successResponse(categories))
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.messgae))
        }
    }

    @httpPatch("/block/:id", validateRequest(BlockCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async blockCategory(@request() req: Request, @response() res: Response) {
        try {
            const blockCategory = await this.categoryService.blockCategory(req.params.id);
            return res.status(200).json(successResponse(blockCategory));
        } catch (error: any) {
            console.log(error.message)
            return res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unBlockCategory(req: Request, res: Response) {
        try {
            const unBlockCategory = await this.categoryService.unBlockCategory(req.params.id);
            return res.status(200).json(successResponse(unBlockCategory));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }
}