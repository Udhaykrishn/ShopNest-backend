import { Role } from "@/constants";
import {
    AuthGuard,
    AuthRequest,
} from "@/decorators/AuthGuard";
import { IAdminAuthService } from "@/services/interface";
import { ADMIN } from "@/types";
import {
    clearAuthCookie,
    errorResponse,
    successResponse ,
} from "@/utils";
import { setAuthHeader } from "@/utils";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import {
    controller,
    httpGet,
    httpPost,
    request,
    response,
} from "inversify-express-utils";


@controller("/auth/admin")
export class AdminAuthController {
    constructor(@inject(ADMIN.AuthAdminService) private readonly adminAuthService: IAdminAuthService) {
    }

    @httpPost("/login")
    async login(@request() req: Request, @response() res: Response) {
        try {
            const admin = await this.adminAuthService.login(req.body)
            await setAuthHeader(admin.token, req, res, Role.ADMIN)
            return res.status(HttpStatusCode.Ok).json(successResponse(admin))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpGet("/profile")
    @AuthGuard(Role.ADMIN)
    async profile(@request() req: AuthRequest, @response() res: Response) {
        try {
            if (!req.admin) {
                return res.status(HttpStatusCode.Unauthorized).json({ message: "Unauthorized: Admin not found" })
            }

            let isAdmin = await this.adminAuthService.profile(req.admin.id)

            return res.status(HttpStatusCode.Ok).json(successResponse(isAdmin))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/logout")
    @AuthGuard(Role.ADMIN)
    async logout(@request() req: AuthRequest, @response() res: Response) {
        try {
            clearAuthCookie(res, "admin_auth_token")
            return res.status(HttpStatusCode.Ok).json(successResponse("Admin logout successfully"))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }
}