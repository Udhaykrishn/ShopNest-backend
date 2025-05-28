import { Request, Response } from "express";
import { inject } from "inversify";
import { IWishlistService } from "@/services/interface";
import { WISHLIST } from "@/types/wishlist";
import { IWishlist } from "@/interface";
import { BaseHttpController, controller, httpDelete, httpGet, httpPost } from "inversify-express-utils";
import { AuthGuard, BlockGuard } from "@/decorators";
import { Role } from "@/constants";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";

@controller("/wishlist")
export class WishlistControler extends BaseHttpController {
    constructor(
        @inject(WISHLIST.wishlistService) private readonly wishlistService: IWishlistService<IWishlist>
    ) { 
        super()
    }


    @httpGet("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getWishlist(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const wishlist = await this.wishlistService.getWishlist(req.user?.id as string,Number(page),Number(limit));
            return res.status(HttpStatusCode.Ok).json(successResponse(wishlist));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpPost("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async addToWislist(req: Request, res: Response) {
        try {
            const { productId } = req.body;

            const wishlist = await this.wishlistService.addProductToWishlist(req.user?.id as string, productId);

            return res.status(HttpStatusCode.Ok).json(successResponse(wishlist));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpDelete("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async removeFromWishlist(req: Request, res: Response) {
        try {
            const  productId  = req.params.id;

            const wishlist = await this.wishlistService.removeFromWishlist(req.user?.id as string, productId);
            return res.status(HttpStatusCode.Ok).json(successResponse(wishlist));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }
}