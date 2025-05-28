import { Role } from "@/constants";
import { AuthGuard, BlockGuard } from "@/decorators";
import { ICouponService } from "@/services/interface/coupon";
import { COUPON } from "@/types/coupon";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import { BaseHttpController, controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from "inversify-express-utils";

@controller("/coupon")
export class CouponController extends BaseHttpController {

    constructor(
        @inject(COUPON.CouponService) private readonly couponService: ICouponService
    ) {
        super();
    }

    @httpPost("/")
    @AuthGuard(Role.ADMIN)
    async createCoupon(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.couponService.create(req.body);
            return res.status(HttpStatusCode.Created).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPatch("/:id")
    @AuthGuard(Role.ADMIN)
    async updateCoupon(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.couponService.update(req.params.id, req.body);
            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpGet("/users")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getValidCoupon(@request() req: Request, @response() res: Response) {
        try {
            const { amount } = req.query;
            const result = await this.couponService.validCoupons(Number(amount))
            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/apply/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async applyCoupon(@request() req: Request, @response() res: Response) {
        try {
            const couponId = req.params.id;
            const { amount } = req.body;
            const result = await this.couponService.apply(req.user?.id as string, couponId, amount)
            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }


    @httpDelete("/remove/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async removeCoupon(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;
            const result = await this.couponService.removeCoupon(req.user?.id as string, id)
            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }


    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getCoupon(@request() req: Request, @response() res: Response) {
        try {
            const { page, limit, search } = req.query
            const result = await this.couponService.findCoupon(Number(page), Number(limit), String(search));
            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            console.log(error)
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

}