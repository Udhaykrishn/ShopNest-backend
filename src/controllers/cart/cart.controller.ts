import { controller, httpDelete, httpGet, httpPost, request, response } from 'inversify-express-utils';
import { Request, Response } from "express"
import { AuthGuard, BlockGuard } from '@/decorators';
import { Role } from '@/constants';
import { inject } from 'inversify';
import { CART } from '@/types/cart';
import { ICartService } from '@/services/interface';
import { HttpStatusCode } from 'axios';
import { errorResponse, successResponse } from '@/utils';
import { ICart } from '@/interface';

@controller("/cart")
export class CartController {

    constructor(@inject(CART.cartService) private readonly cartService: ICartService<ICart>
    ) {
    }

    @httpGet("/count/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async cartCount(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;

            const cartCount = await this.cartService.getCartCount(id)

            return res.status(HttpStatusCode.Ok).json(successResponse(cartCount))

        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }


    @httpGet("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getAllCartById(@request() req: Request, @response() res: Response) {
        try {
            const cart = await this.cartService.getAllCartById(req.user?.id as string)

            return res.status(HttpStatusCode.Ok).json(successResponse(cart))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }

    }

    @httpPost("/stock")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async checkStock(@request() req: Request, @response() res: Response) {
        try {
            const { sku, action,quantity } = req.body;

            console.log("quan:",quantity)

            const cart = await this.cartService.checkStock(req.user?.id as string, sku, action,quantity)

            return res.status(HttpStatusCode.Ok).json(successResponse(cart))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }


    @httpDelete("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async deleteCart(@request() req: Request, @response() res: Response) {
        try {
            const { sku } = req.body;
            const cart = await this.cartService.deleteCartById(req.user?.id as string, sku)

            return res.status(HttpStatusCode.Ok).json(successResponse(cart))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }

    @httpPost("/clear")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async clearCart(@request() req: Request, @response() res: Response) {
        try {
            console.log("user coming",req.user?.id as string)
            const cart = await this.cartService.clearCart(req.user?.id as string)

            return res.status(HttpStatusCode.Ok).json(successResponse(cart))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }

    @httpPost("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async addToCart(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;
            const { productId, sku, quantity } = req.body;
            const cart = await this.cartService.addToCart(id, productId, sku, quantity)

            return res.status(HttpStatusCode.Ok).json(successResponse(cart))
        } catch (error: any) {
            return res.status(HttpStatusCode.BadRequest).json(errorResponse(error.message))
        }
    }
    


}






























