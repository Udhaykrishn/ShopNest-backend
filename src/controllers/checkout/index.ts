import { controller, httpGet, request, response } from "inversify-express-utils";
import { Request, Response } from "express"
import { inject } from "inversify";
import { CHECKOUT } from "@/types/checkout";
import { HttpStatusCode } from "axios";
import { errorResponse, successResponse } from "@/utils";
import { ICheckoutService } from "@/services/interface/checkout";
import { AuthGuard } from '../../decorators/AuthGuard';
import { Role } from "@/constants";
import { BlockGuard } from "@/decorators";

@controller("/checkout")
export class CheckoutController {

    constructor(
        @inject(CHECKOUT.checkoutService) private readonly checkoutService: ICheckoutService
    ) { }

    @httpGet("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getCheckout(@request() req: Request, @response() res: Response) {
        try {
            const checkout = await this.checkoutService.getCheckout(req.user?.id as string, req.body)

            if (!checkout.success) {
                return res.status(HttpStatusCode.Ok).json(checkout)
            }

            return res.status(HttpStatusCode.Ok).json(successResponse(checkout))

        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }
}