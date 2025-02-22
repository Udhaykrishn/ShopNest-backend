import { inject } from "inversify";
import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "@/utils";
import { IProductsServies } from "@/services/products/IProductsServices";


@controller("/products")
export class ProductsController {
    constructor(@inject("ProductsServices") private productsService: IProductsServies) { }

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

            const products = await this.productsService.getProducts({
                page: Number(page),
                limit: Number(limit),
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: String(sortBy),
                search: search ? String(search) : undefined
            });

            return res.status(200).json(successResponse(products))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }
}
