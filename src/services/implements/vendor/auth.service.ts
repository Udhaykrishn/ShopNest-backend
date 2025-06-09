import { IVendor } from "@/models/vendors/interface";
import { USER, VENDOR } from "@/types";
import { inject, injectable } from "inversify";
import {
    IAuthVendorService,
    IOtpService
} from "@/services/interface";
import {
    CreateVendorDTO,
    LoginVendorDTO
} from "@/dtos/vendor/vendor.dto";
import { OtpType, RoleType } from "@/constants";
import {
    errorResponse,
    getPayload,
    hashToBePassword,
    jwtSign,
    passwordToBeHash,
    validateEmail,
    validatePhoneNumber
} from "@/utils";
import { IVendorRepository } from "@/repository/vendor/interface";

@injectable()
export class AuthVendorService implements IAuthVendorService<IVendor> {
    constructor(
        @inject(VENDOR.VendorRepository) private readonly vendorRepository: IVendorRepository<IVendor>,
        @inject(USER.OTPService) private readonly otpService: IOtpService
    ) { }

    async login({ email, password }: LoginVendorDTO): Promise<Record<string, string>> {
        const exsitsVendor = await this.vendorRepository.getVendorByEmail(email);
        if (!exsitsVendor) {
            throw new Error("Vendor not found! Please try again");
        }

        if (exsitsVendor.isRejected) {
            await this.vendorRepository.deleteVendor(exsitsVendor._id as string)
            throw new Error("Vendor not found! Please try again")
        }

        if (exsitsVendor.isBlocked) {
            throw new Error("This account is blocked! Please contact")
        }

        if (!exsitsVendor.isApproved) {
            throw new Error("Your account is not appoved by admin! Please wait")
        }

        const comparePassword = await hashToBePassword(exsitsVendor.password, password);
        if (!comparePassword) {
            throw new Error("Invalid Credential! Please try again");
        }

        const payload = await getPayload(exsitsVendor)

        const token = jwtSign(payload)

        return { token }
    }

    async logout(): Promise<void> {
        console.log("User logged out");
    }

    async signup(data: CreateVendorDTO): Promise<boolean> {
        try {
            const exsitsVendor = await this.vendorRepository.getVendorByEmail(data.email);
            if (exsitsVendor) {
                throw new Error("Vendor already exists");
            }

            const isEmailValid = await validateEmail(data.email)
            if (!isEmailValid) {
                throw new Error("Invalid or non-existent email")
            }

            const isPhoneValid = await validatePhoneNumber(data.phone)

            if (!isPhoneValid) {
                throw new Error("Invalid Indian phone number")
            }

            return await this.otpService.sendOTP(data, OtpType.SIGNUP, RoleType.VENDOR)
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async sendOtp(data: any, type: OtpType, role: RoleType): Promise<boolean> {
        return await this.otpService.sendOTP(data, type, role);
    }

    async verifyEmail(email: string): Promise<{ email: string; }> {

        try {
            const vendor = await this.vendorRepository.getVendorByEmail(email)

            if (!vendor) {
                throw new Error("Email not found! Please enter your email address")
            }

            await this.otpService.sendOneOTP(email, OtpType.FORGOT_PASSWORD, RoleType.VENDOR)

            return { email }
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }


    async resendOtp(email: string, type: OtpType, role: RoleType): Promise<void> {

        const existsVendor = await this.vendorRepository.getVendorByEmail(email)
        if (!existsVendor) {
            throw new Error("Email not found! Please enter your email address")
        }

        const existingOtp = await this.otpService.getOtp(email, type, role);

        if (!existingOtp) {
            throw new Error("OTP not requested for this email. Please request an OTP first.");
        }

        const currentTime = Date.now();
        const otpExpiryTime = new Date(existingOtp.otpExpiry).getTime();

        if (currentTime < otpExpiryTime) {
            throw new Error("You can only request a new OTP after 5 minutes.");
        }

        await this.otpService.sendOneOTP(email, type, role);
    }

    async profile(vendor: Record<string, unknown>): Promise<IVendor> {
        if (!vendor) {
            throw errorResponse("req vendor not found! Please verify")
        }
        const ven = await this.vendorRepository.getVendorById(vendor.id as string)

        if (!ven) {
            throw errorResponse("Vendor not found")
        }

        return ven as IVendor;
    }

    async verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {
        return await this.otpService.verifyOtp(email, otp, type, role);
    }

    async forgotPassword(email: string, type: OtpType, role: RoleType): Promise<void> {
        await this.otpService.sendOneOTP(email, type, role);
    }

    async verifyForgotPassword(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {
        return await this.otpService.passwordVerifyOtp(email, otp, type, role);
    }

    async updatePassword(email: string, password: string): Promise<void> {
        try {
            const vendor = await this.vendorRepository.getVendorByEmail(email)

            if(!vendor){
                throw new Error("Vendor not found")
            }

            const hashedPassword = await passwordToBeHash(password)

            const updatedVendor = await this.vendorRepository.updateVendor(vendor._id,{password:hashedPassword})

            if(!updatedVendor){
                throw new Error("Failed to update vendor")
            }

        } catch (error:any) {  
            throw errorResponse(error.message)
        }
    }
}
