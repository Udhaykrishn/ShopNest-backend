import { validateRequest } from "@/middleware/validation.middleware";
import { clearAuthCookie, errorResponse, setAuthHeader, successResponse } from "@/utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { VENDOR } from "@/types";
import { controller, httpGet, httpPost, request, response } from "inversify-express-utils";
import { CreateVendorDTO, LoginVendorDTO } from "@/dtos/vendor/vendor.dto";
import { IAuthVendorService } from "@/services/interface";
import { IVendor } from "@/models/vendors/interface";
import { Throttle } from "@/decorators/throttle.decorator";
import { AuthGuard, AuthRequest } from "@/decorators/AuthGuard";
import { BlockGuard } from "@/decorators/BlockGurad";
import { OtpType, Role, RoleType } from "@/constants";

@controller("/auth/vendor")
export class AuthVendorController {
    constructor(
        @inject(VENDOR.AuthVendorService) private readonly authVendorService: IAuthVendorService<IVendor>,
    ) { }

    @httpGet("/")
    async getFunc() {
        return "hello world";
    }

    @httpPost("/login", validateRequest(LoginVendorDTO))
    async login(@request() req: Request, @response() res: Response) {
        try {
            const vendor = await this.authVendorService.login(req.body);
            await setAuthHeader(vendor.token, req, res, Role.VENDOR)
            return res.status(201).json(successResponse(vendor, "Vendor login successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/signup", validateRequest(CreateVendorDTO))
    async signup(@request() req: Request, @response() res: Response) {
        try {
            const isDone = await this.authVendorService.signup(req.body);

            if (isDone) {
                return res.status(201).json(successResponse(req.body.email, "OTP sent successfully"));
            } else {
                return res.status(400).json(successResponse("Failed to send OTP"))
            }

        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/logout")
    @AuthGuard(Role.VENDOR)
    async logout(@request() req: Request, @response() res: Response) {
        try {
            await clearAuthCookie(res, "vendor_auth_token")
            return res.status(200).json(successResponse(null, "Vendor logout successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/send-otp")
    async sendOtp(@request() req: Request, @response() res: Response) {
        try {
            await this.authVendorService.sendOtp(req.body.email, OtpType.SIGNUP, RoleType.VENDOR);
            return res.status(200).json(successResponse(null, "OTP sent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/resend-otp")
    async resendOtp(@request() req: Request, @response() res: Response) {
        try {
            await this.authVendorService.resendOtp(req.body.email, OtpType.SIGNUP, RoleType.VENDOR);
            return res.status(200).json(successResponse(null, "OTP resent successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/verify-email")
    async verifyEmail(@request() req: Request, @response() res: Response) {
        try {
            const { email } = await this.authVendorService.verifyEmail(req.body.email);
            return res.status(200).json(successResponse(email, "Email verify successfully done"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/verify-otp")
    async verifyOtp(@request() req: Request, @response() res: Response) {
        try {
            const isValid = await this.authVendorService.verifyOtp(req.body.email, req.body.otp, OtpType.SIGNUP, RoleType.VENDOR);
            return res.status(200).json(successResponse(isValid, "OTP verified successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/verify-password")
    async verifyPassword(@request() req: Request, @response() res: Response) {
        try {
            await this.authVendorService.verifyForgotPassword(req.body.email, req.body.otp, OtpType.FORGOT_PASSWORD, RoleType.VENDOR);
            return res.status(200).json(successResponse(null, "Password reset OTP verified successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }

    @httpPost("/forgot-password")
    async passwordUpdate(@request() req: Request, @response() res: Response) {
        try {
            console.log(req.body)
            await this.authVendorService.updatePassword(req.body.email, req.body.password);
            return res.status(200).json(successResponse(null, "Password updated successfully"));
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message));
        }
    }


    @httpGet("/profile")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async getVendorProfile(@request() req: AuthRequest, @response() res: Response) {
        try {
            const vendor = await this.authVendorService.profile(req.vendor)

            return res.status(vendor ? 200 : 400).json(vendor ? successResponse(vendor,) : errorResponse(vendor))
        } catch (error: any) {
            return res.status(500).json(errorResponse(error.message))
        }
    }
}
