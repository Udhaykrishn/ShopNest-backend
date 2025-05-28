import { WALLET } from "@/types";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";
import { inject } from "inversify";
import { controller, httpGet, httpPost, request, response } from "inversify-express-utils";
import { Request, Response } from "express"; "express"
import { AuthGuard, BlockGuard } from "@/decorators";
import { Role } from "@/constants";
import { IUserWalletService, IVendorWalletService } from "@/services/interface/wallet";

@controller("/wallet")
export class WalletController {

    constructor(
        @inject(WALLET.VendorWalletService) private readonly vendorWalletSerivce: IVendorWalletService,
        @inject(WALLET.UserWalletService) private readonly userWalletService: IUserWalletService
    ) { }

    @httpGet("/vendor")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getVendorWallet(@request() req: Request, @response() res: Response) {
        try {
            const { page, limit } = req.query;

            console.log("page,limit", page, limit)
            const vendorWallet = await this.vendorWalletSerivce.getWalletByVendorId(req.vendor?.id as string, Number(page), Number(limit))
            return res.status(HttpStatusCode.Ok).json(successResponse(vendorWallet))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }


    @httpGet("/user")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getUserWallet(@request() req: Request, @response() res: Response) {
        try {
            const { page = 1, limit = 5 } = req.query;
            const userWallet = await this.userWalletService.getWalletByUserId(req.user?.id as string, Number(page), Number(limit))
            return res.status(HttpStatusCode.Ok).json(successResponse(userWallet))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }


    @httpPost("/user")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async addAmountToWallet(@request() req: Request, @response() res: Response) {
        try {
            const { amount } = req.body;
            const userWallet = await this.userWalletService.addToWallet(req.user?.id as string, amount);
            return res.status(HttpStatusCode.Ok).json(successResponse(userWallet))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/vendor")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async addAmountVendorWallet(@request() req: Request, @response() res: Response) {
        try {
            const { amount } = req.body;

            const userWallet = await this.vendorWalletSerivce.addToWallet(req.vendor?.id as string, amount);
            return res.status(HttpStatusCode.Ok).json(successResponse(userWallet))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

}