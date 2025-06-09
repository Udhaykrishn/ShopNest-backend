import { inject, injectable } from "inversify";
import { IAuthService, IOtpService, IUserService } from "@/services/interface";
import { CreateUserDTO, LoginUserDto } from "@/dtos/users";
import { IUser } from "@/interface/users.interface";
import { GooglePayload, USER } from "@/types";
import { clearAuthCookie, errorResponse, getPayload, hashToBePassword, validateEmail, validatePhoneNumber } from "@/utils";
import { config } from "@/config";
import { OAuth2Client } from "google-auth-library";
import { jwtSign } from "@/utils";
import { OtpType, RoleType } from "@/constants";
import { Response } from "express";



@injectable()
export class AuthService implements IAuthService<IUser> {
    constructor(
        @inject(USER.UserService) private readonly userService: IUserService,
        @inject(USER.OTPService) private readonly otpService: IOtpService,
    ) { }


    async login(data: LoginUserDto): Promise<Record<string, string>> {
        const existingUser = await this.userService.getUserByEmail(data.email)
        if (!existingUser) {
            throw new Error("User not found ! please try again")
        }

        if (existingUser.isBlocked) {
            throw new Error("User blocked by admin")
        }

        const isVerified = await this.otpService.getOtp(data.email, OtpType.SIGNUP, RoleType.USER)

        if (isVerified) {
            throw new Error("Please verify with OTP")
        }

        const comparePassword = await hashToBePassword(existingUser.password, data.password)
        if (!comparePassword) {
            throw new Error("Invalid Credintial! Please try again")
        }

        const payload = await getPayload(existingUser)
        const token = jwtSign(payload)
        return { token }
    }

    async signup(data: CreateUserDTO): Promise<string> {
        try {

            const existingUser = await this.userService.getUserByEmail(data.email as string);
            if (existingUser) {
                throw new Error("User already exists with this email.");
            }

            const isValidEmail = await validateEmail(data.email as string);

            if (!isValidEmail) {
                throw new Error("Invalid email address! Please provide valid email address")
            }

            const isPhoneRealNumber = await validatePhoneNumber(data.phone as string)

            if (!isPhoneRealNumber) {
                throw new Error("Invalid Indian phone number! Please provide valid Indian number")
            }

            const result = await this.otpService.sendOTP(data, OtpType.SIGNUP, RoleType.USER)
            if (!result) {
                throw new Error("Error for ")
            }

            return data.email as string;
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async logout(res: Response): Promise<boolean> {
        try {
            await clearAuthCookie(res,"user_auth_token");
            return true;
        } catch (error:any) {
            throw errorResponse(error.message)
        }
    }

    async profile(id: string): Promise<IUser | null> {
        return this.userService.getUserById(id)
    }

    async googleAuth({ credential }: any): Promise<any> {

        const client = new OAuth2Client(config.GOOGLE_CLIENT_ID)

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: config.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload() as GooglePayload;

        if (!payload?.email_verified) {
            throw new Error("Google account email not verified");
        }

        let user = await this.userService.getUserGoogleEmail(payload.email)

        if (user?.isBlocked) {
            throw new Error("User blocked by admin")
        }

        if (!user) {
            user = await this.userService.createUser({
                email: payload.email,
                username: payload.name,
                googleId: payload.sub,
                avatar: payload.picture,
                password: Math.random().toString(36).slice(-8),
            });
        } else if (!user.googleId) {
            user = await this.userService.updateUser(user._id, {
                googleId: payload.sub,
            });
        }

        const userPayload = await getPayload(user)

        const token = jwtSign(userPayload)
        return { user, token };
    }


    async sendOtp(data: Partial<CreateUserDTO>, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            return await this.otpService.sendOTP(data, type, role);

        } catch (error: any) {
            console.error('OTP Service Error:', error);
            throw errorResponse(error.message)
        }
    }

    async sendOneOtp(email: string, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            console.log("email is one otp", email)
            return await this.otpService.sendOneOTP(email, type, role);
        } catch (error: any) {
            console.error('OTP Service Error:', error);
            throw errorResponse(error.message)
        }
    }

    async verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {

        const otpWithUser = await this.otpService.verifyOtp(email, otp, type, role);

        return otpWithUser
    }

    async verifyPassword(email: string, password: string): Promise<boolean> {
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new Error("User not found");

        const isValid = await hashToBePassword(user.password, password)
        if (!isValid) throw new Error("Invalid credentials");

        return true;
    }

}