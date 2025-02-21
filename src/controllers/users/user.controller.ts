import { id, inject } from "inversify";
import { controller, httpGet, httpPatch, httpPost, httpPut, request, response } from "inversify-express-utils";
import { USER } from "@/types";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "@/utils/api-respnose.utils";
import { IUserService } from "@/services/interface/user.interface";
import { validateRequest } from "@/middleware/validation.middleware";
import { CreateUserDTO, ForgotPasswordDto, SendOtpDto, VerifyOtpDto } from "@/dtos/users";
import { Throttle } from "@/decorators/throttle.decorator";
import { AuthGuard, Role as AuthRole } from "@/decorators/AuthGuard";
import { OtpType, Role } from "@/constants";
import { BlockGuard } from "@/decorators/BlockGurad";

@controller("/users")
export class UserController {
    constructor(@inject(USER.UserService) private readonly userService: IUserService) { }

    @httpGet("/")
    @Throttle(5, 60000)


    async getUsers(@request() req: Request, @response() res: Response) {
        try {
            const { search, page = 1, limit = 10 } = req.query;
            const result = await this.userService.getAllUsers(search as string, Number(page), Number(limit));
            return res.json(successResponse(result, "Users retrieved successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(AuthRole.USER)
    @BlockGuard()
    async getUserById(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            if (!user) return res.status(404).json(errorResponse("User not found"));
            return res.json(successResponse(user, "User retrieved successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/", validateRequest(CreateUserDTO))

    @AuthGuard(AuthRole.USER)
    @BlockGuard()
    async createUser(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.userService.createUser(req.body);
            return res.status(201).json(successResponse(user, "User created successfully"));
        } catch (error: any) {
            console.log(error)
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPut("/:id")
    @BlockGuard()
    @AuthGuard(AuthRole.USER)
    async updateUser(@request() req: Request, @response() res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userService.updateUser(id, req.body);
            if (!user) return res.status(404).json(errorResponse("User not found"));
            return res.json(successResponse(user, "User updated successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }



    @httpPost("/send-otp", validateRequest(SendOtpDto))
    async sendOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email } = req.body;
            await this.userService.sendOtp(email, "SIGNUP", "user");
            return res.json(successResponse({}, "OTP sent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/resend-otp", validateRequest(SendOtpDto))
    async resendOtp(@request() req: Request, @response() res: Response) {
        try {
            console.log(req.body)
            const { email } = req.body;
            await this.userService.sendOtp(email, "SIGNUP", "user");
            return res.json(successResponse({}, "OTP resent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/verify-otp", validateRequest(VerifyOtpDto))
    async verifyOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email, otp } = req.body;
            console.log("lol")
            const isValid = await this.userService.verifyOtp(email, otp, OtpType.SIGNUP, Role.user);
            if (!isValid) return res.status(400).json(errorResponse("Invalid OTP"));
            return res.json(successResponse({}, "OTP verified successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost('/verify-email')
    async verifyEmail(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.userService.getUserByEmail(req.body.email)

            const isDone = await this.userService.sendOtp(user?.email, OtpType.FORGOT, Role.user)
            if (isDone) {
                return res.status(200).json(successResponse(user?.email))
            } else {
                return res.status(400).json(errorResponse("Failed to send OTP"))
            }
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    @httpPost('/forgot-password')
    async forgotPassword(@request() req: Request, @response() res: Response) {
        try {

            const { password, email } = req.body;

            const users = await this.userService.getUserByEmail(email)

            if (!users) {
                throw new Error("User not found! Please register")
            }

            await this.userService.updateUser(users._id, { password })

            return res.status(200).json(successResponse("Password change successfully"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    @httpPost("/forgot-password-otp", validateRequest(ForgotPasswordDto))
    async forgotPasswordOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email } = req.body;
            await this.userService.sendOtp(email, OtpType.FORGOT, Role.user);
            return res.json(successResponse({}, "OTP sent for password reset"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/forgot-password-verify", validateRequest(VerifyOtpDto))
    async forgotPasswordVerify(@request() req: Request, @response() res: Response) {
        try {
            console.log("working the password section now")
            const { email, otp } = req.body;
            console.log(email, otp)
            const isValid = await this.userService.verifyOtp(email, otp, OtpType.FORGOT, Role.user);
            if (!isValid) return res.status(400).json(errorResponse("Invalid OTP found"));
            return res.json(successResponse({}, "OTP verified successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }
}
