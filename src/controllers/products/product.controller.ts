import { inject } from "inversify";
import { controller, httpGet, response, request, httpPatch, httpPost, httpPut } from "inversify-express-utils";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "@/utils";
import { IProductsService } from "@/services/interface/products";
import { ApprovalStatus } from "@/interface/product.interface";
import { AuthGuard, BlockGuard } from "@/decorators";
import { Role } from '@/constants';
import { PRODUCT, USER, VENDOR } from "@/types";
import { IVendorRepository } from "@/repository/vendor/interface";
import { IVendor } from "@/models/vendors/interface";
import { IEmailService } from "@/services/interface";
import { OtpType } from "@/constants";
import { validateRequest } from "@/middleware/validation.middleware";
import { CreateProductDTO } from "@/dtos/vendor/product.dto";
import { HttpStatusCode } from "axios";


@controller("/products")
export class ProductsController {
    constructor(
        @inject(PRODUCT.ProductService) private readonly productsService: IProductsService,
        @inject(VENDOR.VendorRepository) private readonly vendorRepository: IVendorRepository<IVendor>,
        @inject(USER.EmailService) private readonly emailService: IEmailService
    ) { }

    @httpGet("/")
    async getProducts(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 10,
                minPrice,
                maxPrice,
                sortBy = "createdAt",
                search,
                status,
                subcategory
            } = req.query;


            const statusCode: Record<string, ApprovalStatus> = {
                pending: ApprovalStatus.PENDING,
                approved: ApprovalStatus.APPROVED,
                rejected: ApprovalStatus.REJECTED,
            };

            const products = await this.productsService.getAllProducts({
                page: page ? Number(page) : 0,
                limit: limit ? Number(limit) : 5,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: sortBy ? String(sortBy) : undefined,
                search: search ? String(search) : undefined,
                subcategory: subcategory ? String(subcategory) : undefined,
                status: status ? statusCode[String(status)] : undefined
            });


            return res.status(200).json(successResponse(products))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }


    @httpGet("/category")
    @BlockGuard(Role.USER)
    async getAllProductsByCategory(
        @request() req: Request,
        @response() res: Response
    ) {
        try {
            const { page = 1, limit = 5, category, search, subcategory, minPrice, maxPrice, sortBy } = req.query

            const products = await this.productsService.getProductByCategory({
                page: page as number,
                limit: limit as number,
                category: String(category ? category : ""),
                search: String(search ? search : ""),
                subcategory: String(subcategory ? subcategory : ""),
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: String(sortBy ? sortBy : "newest"),
            })

            return res.status(products ? 200 : 404).json(products ? successResponse(products, "Products get successfully") : errorResponse("Products not found"))
        } catch (error) {
            return res.status(500).json(errorResponse("Product not found"))
        }
    }



    @httpGet("/vendor/:id")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getById(req: Request, res: Response) {
        try {

            const product = await this.productsService.getProductById(req.params.id);
            return product ? res.json(successResponse(product, "Product get successfully ")) : res.status(404).json(errorResponse("Product not found"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Internal Server Error", error.statusCode || 500));
        }
    }

    @httpGet("/:id/vendor")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getVendorById(req: Request, res: Response) {
        try {
            const product = await this.productsService.getProductByVendor(req.params.id)
            return res.json(successResponse(product, "Get all product by vendor"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Interval Server error", error.statusCode || 500))
        }
    }

    @httpGet("/:id")
    async getProductsById(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params

            const product = await this.productsService.getProductById(id)
            return res.status(product ? 200 : 400).json(product ? successResponse(product) : errorResponse(product))
        } catch (error) {
            return res.status(500).json(errorResponse("Product not found"))
        }
    }

    @httpPost("/stock")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async checkStock(@request() req: Request, @response() res: Response) {
        try {
            const { sku, action, productId,quantity } = req.body;

            let stock = await this.productsService.stockCheck(productId, sku, action,quantity)

            return res.status(HttpStatusCode.Ok).json(successResponse(stock))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }


    @httpPost("/:id", validateRequest(CreateProductDTO))
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async create(req: Request, res: Response) {
        try {
            console.log(req.body)
            const product = await this.productsService.createProduct(req.params.id, req.body)

            return res.status(201).json(successResponse(product, "Product created successfully"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Internal Server Error", error.statusCode || 500));
        }
    }

    @httpPut("/:id")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async update(req: Request, res: Response) {
        try {
            const updatedProduct = await this.productsService.updateProduct(req.params.id, req.body);
            return updatedProduct ? res.json(successResponse(updatedProduct)) : res.status(404).json(errorResponse("Product not found"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Internal Server Error", error.statusCode || 500));
        }
    }


    @httpPatch("/block/:id")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async block(req: Request, res: Response) {
        try {
            const product = await this.productsService.blockProduct(req.params.id);
            return res.json(successResponse(product, "Product blocked"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Internal Server Error", error.statusCode || 500));
        }
    }
    
    @httpPatch("/unblock/:id")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async unblock(req: Request, res: Response) {
        try {
            const product = await this.productsService.unblockProduct(req.params.id);
            return res.json(successResponse(product, "Product unblocked"));
        } catch (error: any) {
            return res.status(error.statusCode || 500).json(errorResponse(error.message || "Internal Server Error", error.statusCode || 500));
        }
    }


    @httpPatch('/approve/:id')
    @AuthGuard(Role.ADMIN)
    async approve(@request() req: Request, @response() res: Response) {
        try {
            const products = await this.productsService.approve(req.params.id)

            if (!products) {
                throw new Error("Product not found")
            }

            const vendor = await this.vendorRepository.getVendorById(products.vendorId.toString())

            await this.emailService.sendProductStatusEmail(vendor?.email as string, OtpType.PRODUCT_APPROVED, products.name)

            return res.status(200).json(successResponse(products, "Product approved successuflly"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }
    @httpPatch('/reject/:id')
    @AuthGuard(Role.ADMIN)
    async reject(@request() req: Request, @response() res: Response) {
        try {
            const products = await this.productsService.reject(req.params.id)

            if (!products) {
                throw new Error("Product not found")
            }
            const vendor = await this.vendorRepository.getVendorById(products.vendorId.toString())

            await this.emailService.sendProductStatusEmail(vendor?.email as string, OtpType.PRODUCT_REJECTED, products.name)

            return res.status(200).json(successResponse(products, "Product approved successuflly"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    

}
