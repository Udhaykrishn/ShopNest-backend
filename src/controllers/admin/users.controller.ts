import { ADMINUSER } from '@/types';
import { Request, Response } from "express";
import { controller, httpPut, httpGet, httpPatch } from "inversify-express-utils";
import { inject } from "inversify";
import { successResponse, errorResponse } from "@/utils/api-respnose.utils";
import { IAdminUserService } from "@/services/interface/admin-user.interface";
import { AuthGuard, Role } from '@/decorators/AuthGuard';


@controller("/admin/users")
export class AdminUserController {
    constructor(@inject(ADMINUSER.AdminUserService) private readonly userService: IAdminUserService) { }

    @httpPatch("/block/:id")
    @AuthGuard(Role.ADMIN)
    async blockUser(req: Request, res: Response) {
        try {
            const user = await this.userService.blockUser(req.params.id);
            res.json(successResponse(user, "User blocked successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unblockUser(req: Request, res: Response) {
        try {
            const user = await this.userService.unblockUser(req.params.id);
            res.json(successResponse(user, "User unblocked successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getUsers(req: Request, res: Response) {
        try {
            const { search, page, limit } = req.query;
            const pageNumber = Number(page)
            const limitNumber = Number(limit)
            const users = await this.userService.getUsers(search as string, pageNumber, limitNumber);
            console.log(users)
            res.json(successResponse(users, "Users retrieved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.ADMIN)
    async getUserById(req: Request, res: Response) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            res.json(successResponse(user, "User retrieved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpGet("/email/:email")
    @AuthGuard(Role.ADMIN)
    async getUserByEmail(req: Request, res: Response) {
        try {
            const user = await this.userService.getUserByEmail(req.params.email);
            res.json(successResponse(user, "User retrieved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }
}
