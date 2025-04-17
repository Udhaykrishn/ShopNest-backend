import { inject } from "inversify";
import {
    controller,
    httpGet,
    httpPatch,
    httpPost,
    httpPut,
    request,
    response
} from "inversify-express-utils";
import { USER } from "@/types";
import { Request, Response } from "express";
import {
    successResponse,
    errorResponse
} from "@/utils";
import { IUserService } from "@/services/interface/user";
import { validateRequest } from "@/middleware/validation.middleware";
import {
    CreateUserDTO,
    UpdateUserDTO,
} from "@/dtos/users";
import { AuthGuard } from "@/decorators/AuthGuard";
import { BlockGuard } from "@/decorators/BlockGurad";
import { OtpType, Role, RoleType } from '@/constants';
import { HttpStatusCode } from "axios";
import { IOtpService } from "@/services/interface";

@controller("/users")
export class UserController {
    constructor(
        @inject(USER.UserService) private readonly userService: IUserService,
        @inject(USER.OTPService) private readonly otpService: IOtpService
    ) { }

    @httpGet("/")
    async getUsers(@request() req: Request, @response() res: Response) {
        try {
            const { search, page = 1, limit = 10 } = req.query;
            const result = await this.userService.getAllUsers(search as string, Number(page), Number(limit));
            return res.status(HttpStatusCode.Ok).json(successResponse(result, "Users retrieved successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getUserById(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            if (!user) return res.status(HttpStatusCode.NotFound).json(errorResponse("User not found"));
            return res.status(HttpStatusCode.Ok).json(successResponse(user, "User retrieved successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/email/change")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async changeEmail(@request() req: Request, @response() res: Response) {
        try {
            const updateUserWithEmail = await this.userService.updateUser(req.user?.id as string, { email: req.body.email });
            return res.status(HttpStatusCode.Ok).json(successResponse(updateUserWithEmail))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/old-email/confirm")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async checkOldEmail(@request() req: Request, @response() res: Response) {
        try {
            const newEmail = await this.userService.CheckEmail(req.user?.id as string, req.body.email);

            await this.otpService.sendOneOTP(newEmail, OtpType.CHANGE_EMAIL, RoleType.USER)

            return res.status(HttpStatusCode.Ok).json(successResponse(`OTP sent to ${newEmail}! Please check the inbox`))

        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPost("/verify-email-otp")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async checkOldEmailOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email, otp } = req.body;

            const result = await this.otpService.verifyEmailOTP(email, otp, OtpType.CHANGE_EMAIL, RoleType.USER)

            return res.status(HttpStatusCode.Ok).json(successResponse(`OTP verify successfully done`))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(error.message)
        }
    }

    @httpPost("/new-email/confirm")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async confirmEmail(@request() req: Request, @response() res: Response) {
        try {
            const newEmail = await this.userService.updateEmailConfirm(req.body.email);

            await this.otpService.sendOneOTP(newEmail, OtpType.CHANGE_EMAIL, RoleType.USER)
            return res.status(HttpStatusCode.Found).json(successResponse(`OTP sent to ${newEmail}. Please check your inbox`))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }



    @httpPost("/", validateRequest(CreateUserDTO))
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async createUser(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.userService.createUser(req.body);
            return res.status(201).json(successResponse(user, "User created successfully"));
        } catch (error: any) {
            console.log(error)
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPut("/", validateRequest(UpdateUserDTO))
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async updateUser(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.userService.updateUser(req.user?.id as string, req.body);
            if (!user) return res.status(404).json(errorResponse("User not found"));
            return res.json(successResponse(user, "User updated successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }


    @httpGet("/email/:email")
    @AuthGuard(Role.ADMIN)
    async getUserByEmail(req: Request, res: Response) {
        try {
            const user = await this.userService.getUserByEmail(req.params.email);
            return res.json(successResponse(user, "User retrieved successfully"));
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unblockUser(req: Request, res: Response) {
        try {
            const user = await this.userService.unblockUser(req.params.id);
            return res.json(successResponse(user, "User unblocked successfully"));
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/block/:id")
    @AuthGuard(Role.ADMIN)
    async blockUser(req: Request, res: Response) {
        try {
            const user = await this.userService.blockUser(req.params.id);
            return res.json(successResponse(user, "User blocked successfully"));
        } catch (error: any) {
            return res.status(400).json(errorResponse(error.message));
        }
    }
}
