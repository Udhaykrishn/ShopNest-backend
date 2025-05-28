import { Role } from "@/constants";
import { AuthGuard, BlockGuard } from "@/decorators";
import { IPaymentService } from "@/services/interface/payment";
import { PAYMENT } from "@/types/payment";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpPost, request, response } from "inversify-express-utils";

@controller("/payment")
export class PaymentController {

    constructor(
        @inject(PAYMENT.PaymentService) private readonly paymentService: IPaymentService
    ) { }

    @httpPost("/user")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async createPaymentOrder(@request() req: Request, @response() res: Response) {
        try {
            const { amount } = req.body;
            
            console.log("amount is: ",amount)

            const paymentOrder = await this.paymentService.create(amount)

            return res.status(HttpStatusCode.Created).json(successResponse(paymentOrder))

        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/retry/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getRetryPayment(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.paymentService.retry(req.params.id, req.body.orderId)

            return res.status(HttpStatusCode.Ok).json(successResponse(result))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }
} 