import { Role } from "@/constants";
import { AuthGuard, BlockGuard } from "@/decorators";
import { SaleService } from "@/services/implements/sales";
import { SALES } from "@/types/sales";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, request, response } from "inversify-express-utils";


@controller("/sales")
export class SalesController extends BaseHttpController {
    constructor(
        @inject(SALES.SalesService) private readonly saleService: SaleService
    ) {
        super();
    }


    @httpGet("/admin")
    @AuthGuard(Role.ADMIN)
    async getAllSales(@request() req: Request, @response() res: Response) {
        try {

            const { date, start, end } = req.query

            const salesReport = await this.saleService.admin(String(date), String(start), String(end));

            return res.status(HttpStatusCode.Ok).json(successResponse(salesReport))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }


    @httpGet("/vendor")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getAllVendorSalesReport(@request() req: Request, @response() res: Response) {
        try {
            const { date, start, end } = req.query;

            const salesReport = await this.saleService.vendor(String(date), String(start), String(end), req.vendor?.id as string)

            return res.status(HttpStatusCode.Ok).json(successResponse(salesReport))

        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }
}