import { inject } from "inversify";
import {
    controller,
    httpGet,
    response,
    request,
    httpPost,
    httpPut,
    httpPatch
} from "inversify-express-utils";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "@/utils";
import { ICategoryServies } from "@/services/implements/categorys/ICategory.service";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { config } from "@/config";
import { validateRequest } from "@/middleware/validation.middleware";
import { BlockCategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from "@/dtos/admin/category.dto";
import { AuthGuard } from "@/decorators";
import { Role } from "@/constants";
import { CATEGORY } from "@/types";
import { HttpStatusCode } from "axios";


@controller("/categorys")
export class CategorysController {
    constructor(@inject(CATEGORY.categoryServices) private readonly categoryService: ICategoryServies) {
    }

    @httpGet("/")
    async getProducts(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit,
                minPrice,
                maxPrice,
                sortBy = "createdAt",
                search,
                isBlocked
            } = req.query;

            const parsedLimit = limit ? Number(limit) : null;
            const parsedPage = Number(page)

            const categorys = await this.categoryService.getCategorys({
                page: parsedPage,
                limit: parsedLimit as number,
                isBlocked: isBlocked ? isBlocked : undefined as any,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: String(sortBy),
                search: search ? String(search) : undefined,
            });

            return res.status(HttpStatusCode.Ok).json(successResponse(categorys))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }

    }


    @httpPost("/gemini")
    async getGemini(@request() req: Request, @response() res: Response) {
        let geni = new GoogleGenerativeAI(config.GEMINI_API)
        try {
            const model = geni.getGenerativeModel({ model: "gemini-1.5-flash" })

            const result = await model.generateContent(req.body.prompt)

            const responoseText = result.response.text()

            return res.status(HttpStatusCode.Ok).json(successResponse(responoseText))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(error.message)
        }
    }


    @httpPost("/", validateRequest(CreateCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async createCategory(req: Request, res: Response) {
        try {
            const category = await this.categoryService.createCategory(req.body);
            return res.status(HttpStatusCode.Created).json(successResponse(category))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }



    @httpPut("/:id", validateRequest(UpdateCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async updateCategory(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.updateCategory(req.params.id, req.body)
            return res.status(HttpStatusCode.Ok).json(successResponse(categories))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.messgae))
        }
    }


    @httpPatch("/block/:id", validateRequest(BlockCategoryDTO))
    @AuthGuard(Role.ADMIN)
    async blockCategory(@request() req: Request, @response() res: Response) {
        try {
            const blockCategory = await this.categoryService.blockCategory(req.params.id);
            return res.status(HttpStatusCode.Ok).json(successResponse(blockCategory));
        } catch (error: any) {
            console.log(error.message)
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unBlockCategory(req: Request, res: Response) {
        try {
            const unBlockCategory = await this.categoryService.unBlockCategory(req.params.id);
            return res.status(HttpStatusCode.Ok).json(successResponse(unBlockCategory));
        } catch (error: any) {
            res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }
}
