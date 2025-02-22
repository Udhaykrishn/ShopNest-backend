import { AuthGuard, AuthRequest, Role } from "@/decorators/AuthGuard";
import { IAdmin } from "@/models/admins/interface";
import { IAdminAuthService } from "@/services/interface/auth-admin.interface";
import { ADMIN } from "@/types";
import { errorResponse, successResponse } from "@/utils";
import { setAuthHeader } from "@/utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, request, response, } from "inversify-express-utils";


@controller("/auth/admin")
export class AdminAuthController {
    constructor(@inject(ADMIN.AuthAdminService) private readonly adminAuthService: IAdminAuthService) {
    }

    @httpPost("/login")
    async login(@request() req: Request, @response() res: Response) {
        try {
            const admin = await this.adminAuthService.login(req.body)
            await setAuthHeader(admin.token, res)
            return res.status(200).json(successResponse(admin))
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.message))
        }
    }

    @httpGet("/profile")
    @AuthGuard(Role.ADMIN)
    async profile(@request() req: AuthRequest, @response() res: Response) {
        try {
            if (!req.admin) {
                return res.status(401).json({ message: "Unauthorized:User not found" })
            }

            let isAdmin = await this.adminAuthService.profile(req.admin.id)

            

            return res.status(200).json(successResponse(isAdmin))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    @httpPost("/logout")
    @AuthGuard(Role.ADMIN)
    async logout(@request() req: AuthRequest, @response() res: Response) {
        try {
            const isLogout = await this.adminAuthService.logout(res)
            return res.status(200).json(successResponse("User logout successfully"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }
}