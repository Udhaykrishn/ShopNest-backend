import { CreateUserDTO, ForgotPasswordDto, LoginUserDto, SendOtpDto, VerifyOtpDto } from "@/dtos/users";
import { validateRequest } from "@/middleware/validation.middleware";
import { errorResponse, setAuthHeader, successResponse } from "@/utils";
import { inject } from "inversify";
import { Request, Response } from "express";
import { controller, httpPost, response, request, httpGet } from "inversify-express-utils";
import { IAuthService, IOtpService, IUserService } from "@/services/interface";
import { AuthGuard, AuthRequest } from "@/decorators/AuthGuard";
import { IUser } from "@/interface/users.interface";
import { BlockGuard } from "@/decorators/BlockGurad";
import { OtpType, Role, RoleType } from "@/constants";
import { USER } from "@/types";


@controller("/auth/user")
export class AuthController {
    constructor(@inject("AuthService") private readonly authService: IAuthService<IUser>,
        @inject(USER.UserService) private readonly userService: IUserService,
        @inject(USER.OTPService) private readonly otpService: IOtpService
    ) { }


    @httpPost("/login", validateRequest(LoginUserDto))
    async login(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.authService.login(req.body)
            console.log("user ",user)
            await setAuthHeader(user.token, req, res, Role.USER)
            return res.status(201).json(successResponse(user, "User login successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }


    @httpPost("/signup", validateRequest(CreateUserDTO))
    async signup(req: Request, res: Response) {
        try {
            const user = await this.authService.signup(req.body)
            console.log(user)
            return res.status(201).json(successResponse(user, "User created successfully"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }


    @httpPost("/logout")
    @AuthGuard(Role.USER)
    async logout(@request() req: Request, @response() res:Response) {
        try {
            const user = await this.authService.logout(res);
            return res.status(200).json(successResponse(user, "User logout successfully"))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    @httpPost('/google')
    async googleAuth(@request() req: Request, @response() res: Response) {

        try {

            const { user, token } = await this.authService.googleAuth(req.body)

            await setAuthHeader(token, req, res, Role.USER);

            return res.status(200).json(successResponse({ user, token }, "User login succesfully"));

        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpGet("/profile")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async profile(@request() req: AuthRequest, @response() res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized:User not found" })
            }
            const user = await this.authService.profile(req.user.id)
            return res.status(200).json(successResponse(user))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }

    @httpPost("/send-otp", validateRequest(SendOtpDto))
    async sendOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email } = req.body;
            await this.authService.sendOtp(email, OtpType.SIGNUP, RoleType.USER);
            return res.json(successResponse({}, "OTP sent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }


    @httpPost("/resend-otp", validateRequest(SendOtpDto))
    async resendOtp(@request() req: Request, @response() res: Response) {
        try {
            console.log("resend otp", req.body)
            const { email } = req.body;
            await this.authService.sendOneOtp(email, OtpType.SIGNUP, RoleType.USER);
            return res.json(successResponse({}, "OTP resent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }


    @httpPost("/verify-otp", validateRequest(VerifyOtpDto))
    async verifyOtp(@request() req: Request, @response() res: Response) {
        try {
            const { email, otp } = req.body;
            const isValid = await this.authService.verifyOtp(email, otp, OtpType.SIGNUP, RoleType.USER);
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

            if (!user) {
                throw new Error("User not found! Enter exisiting email address")
            }

            const isDone = await this.authService.sendOneOtp(user.email, OtpType.FORGOT_PASSWORD, RoleType.USER)
            if (isDone) {
                return res.status(200).json(successResponse(user?.email, "OTP sent successfully"))
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

            console.log("password getting is: ", password)

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
            await this.authService.sendOneOtp(email, OtpType.FORGOT_PASSWORD, RoleType.USER);
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
            const isValid = await this.otpService.passwordVerifyOtp(email, otp, OtpType.FORGOT_PASSWORD, RoleType.USER);
            if (!isValid) return res.status(400).json(errorResponse("Invalid OTP found"));
            return res.json(successResponse({}, "OTP verified successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }
}