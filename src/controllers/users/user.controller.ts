import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, httpDelete, httpPut, request, response } from "inversify-express-utils";


@controller("/users")
export class UserController {
    constructor() {

    }

    @httpGet("/")
    async getUsers(@request() req: Request, @response() res: Response) {
        return res.json({ message: "Hello from user side" })
    }

    @httpPost("/send-otp")
    async sendOTP(req: Request, res: Response): Promise<Response> {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        try {
            await this.authService.sendOTP(email);
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    @httpPost("/resend-otp")
    async resendOTP(req: Request, res: Response): Promise<Response> {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        try {
            await this.authService.resendOTP(email);
            return res.status(200).json({ message: "New OTP sent successfully" });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @httpPost("/verify-otp")
    async verifyOTP(req: Request, res: Response): Promise<Response> {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

        const result = await this.authService.verifyOTP(email, otp);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ message: result.message });
    }
}