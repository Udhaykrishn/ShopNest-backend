import {
    controller,
    httpDelete,
    httpGet,
    httpPatch,
    httpPost,
    request,
    response
} from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { IOrderService } from "@/services/interface";
import { successResponse, errorResponse } from "@/utils";
import { HttpStatusCode as HttpStatus } from "axios";
import { ORDER } from "@/types/orders";
import { AuthGuard, BlockGuard } from "@/decorators";
import { Role } from "@/constants";
import { IInvoiceService } from "@/services/interface/invoice";

@controller("/order")
export class OrderController {
    constructor(
        @inject(ORDER.OrderService) private readonly orderService: IOrderService,
        @inject(ORDER.InvoiceService) private readonly invocieService: IInvoiceService
    ) { }

    @httpPost("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async createOrder(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.orderService.createOrder(req.user?.id as string, req.body);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPatch("/status/:sku")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async updateStatus(@request() req: Request, @response() res: Response) {
        try {
            const updateOrder = await this.orderService.updateStatus(req.params.sku, req.body.orderId, req.body.status);
            return res.status(HttpStatus.Ok).json(successResponse(updateOrder));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpGet("/invoice/:orderId")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async downloadInvoice(@request() req: Request, @response() res: Response) {
        try {
            const { orderId } = req.params
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
            await this.invocieService.getTemplate(req.user?.id as string, orderId, res)
        } catch (error: any) {
            console.error('Error generating invoice:', error);
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpGet("/vendor")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getOrderByVendor(@request() req: Request, @response() res: Response) {
        try {
            const { page, limit, search } = req.query;
            console.log(search)
            const ordersByVendor = await this.orderService.getOrderByVendor(req.vendor?.id as string, Number(page), Number(limit), String(search))
            return res.status(HttpStatus.Ok).json(successResponse(ordersByVendor));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPatch("/cancel/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async cancelSingleProductInOrder(@request() req: Request, @response() res: Response) {
        try {
            const { id: orderId } = req.params;
            const { reason, itemOrderId } = req.body;
            console.log(req.body, orderId)
            const cancelOneItem = await this.orderService.cancelOrderOneItem(req.user?.id as string, orderId, itemOrderId, reason)
            return res.status(HttpStatus.Ok).json(successResponse(cancelOneItem))
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPost("/return-request/:orderId")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async createReturnRequest(@request() req: Request, @response() res: Response) {
        try {
            const { orderId } = req.params;
            const { reason, sku } = req.body;
            const result = await this.orderService.createReturnRequest(req.user?.id as string, orderId, reason, sku);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPatch("/return-request/approve/:orderId")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async approveReturnRequest(@request() req: Request, @response() res: Response) {
        try {
            const { orderId } = req.params;
            const { sku, reason } = req.body;
            const result = await this.orderService.approveReturnRequest(orderId, sku, reason);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPatch("/return-request/reject/:orderId")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async rejectReturnRequest(@request() req: Request, @response() res: Response) {
        try {
            const { orderId } = req.params;
            const { sku, reason } = req.body;
            const result = await this.orderService.rejectReturnRequest(orderId, sku, reason);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpGet("/return-status/:orderId")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getReturnStatus(@request() req: Request, @response() res: Response) {
        try {
            const { orderId } = req.params;
            const result = await this.orderService.getReturnStatus(orderId, req.vendor?.id as string);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }


    @httpGet("/summary/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getOrderSummary(@request() req: Request, @response() res: Response) {
        try {
            const summary = await this.orderService.getOrderSummary(req.params.id);
            return res.status(HttpStatus.Ok).json(successResponse(summary));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getOrderDetails(@request() req: Request, @response() res: Response) {
        try {
            const order = await this.orderService.getOrderDetails(req.user?.id as string, req.params.id);
            return res.status(HttpStatus.Ok).json(successResponse(order));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpDelete("/:id")
    async cancelOrder(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.orderService.cancelOrder(req.params.id);
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }


    @httpGet("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getOrderByUserId(@request() req: Request, @response() res: Response) {
        try {
            const { page, limit, search } = req.query

            const result = await this.orderService.getAllOrderByUserId(req.user?.id as string, Number(page) || 1, Number(limit), search ? String(search) : null)
            return res.status(HttpStatus.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatus.InternalServerError).json(errorResponse(error.message));
        }
    }
}