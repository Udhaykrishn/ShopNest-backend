import { Role } from "@/constants";
import { AuthGuard } from "@/decorators";
import { errorResponse, successResponse } from "@/utils";
import { OFFERS } from "@/types"
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPatch, httpPost, request, response } from "inversify-express-utils";
import { IOfferService } from "@/services/interface/offers";

@controller("/offers")
export class OfferController extends BaseHttpController {

    constructor(
        @inject(OFFERS.OfferService) private readonly couponService: IOfferService
    ) {
        super();
    }

    @httpPost("/")
    @AuthGuard(Role.ADMIN)
    async createCoupon(@request() req: Request, @response() res: Response) {
        try {
            console.log(req.body)
            const createdOffer = await this.couponService.create(req.body);
            return res.status(HttpStatusCode.Created).json(successResponse(createdOffer))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPatch("/:id")
    @AuthGuard(Role.ADMIN)
    async updateCoupon(@request() req: Request, @response() res: Response) {
        try {
            const updatedOffer = await this.couponService.update(req.params.id, req.body);
            return res.status(HttpStatusCode.Ok).json(successResponse(updatedOffer))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getCoupon(@request() req: Request, @response() res: Response) {
        try {
            const { page, limit, search } = req.query
            const allOffers = await this.couponService.findCoupon(Number(page), Number(limit), String(search));
            return res.status(HttpStatusCode.Ok).json(successResponse(allOffers))
        } catch (error: any) {
            console.log(error)
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

}