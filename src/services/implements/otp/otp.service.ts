import { USER, VENDOR } from "@/types";
import { inject, injectable } from "inversify";
import { IOtpData } from "@/models/users/interface";
import { errorResponse, generateOTP, verifyHashedOTP } from "@/utils";
import { IOtpService, IEmailService, ICartService } from "@/services/interface"
import { IOtpRepository } from "@/repository/otp/interface/otp.interface";
import { CreateUserDTO } from "@/dtos/users";
import { dataToEncript, encryptToData } from "@/utils/crypto.utils";
import { IUserRepository } from "@/repository/users/interface/user.interface";
import { IVendor } from "@/models/vendors/interface";
import { IUser } from "@/interface/users.interface";
import { CreateVendorDTO } from "@/dtos/vendor/vendor.dto";
import { IVendorRepository } from '@/repository/vendor/interface';
import { OtpType, RoleType } from "@/constants";
import { CART } from "@/types/cart";
import { ICart } from "@/interface";

@injectable()
export class OtpService implements IOtpService {
    constructor(
        @inject(USER.OTPRepository) private readonly otpRepository: IOtpRepository,
        @inject(USER.EmailService) private readonly emailService: IEmailService,
        @inject(USER.UserRepository) private readonly userRepository: IUserRepository,
        @inject(VENDOR.VendorRepository) private readonly vendorRepository: IVendorRepository<IVendor>,
        @inject(CART.cartService) private readonly cartService: ICartService<ICart>
    ) { }

    async sendOTP(data: Partial<CreateUserDTO>, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            const otp = generateOTP();
            const expiryDate = new Date(Date.now() + 5 * 60 * 1000);

            await this.emailService.sendOtpEmail(data.email as string, type, otp);

            const encryptData = dataToEncript(data)

            await this.otpRepository.setOtp(data.email as string, otp, type, role, expiryDate, encryptData);

            return true

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async sendOneOTP(email: string, type: OtpType, role: RoleType): Promise<any> {
        try {
            const isAlreadyExists = await this.otpRepository.getOtpData(email, type, role)

            if (isAlreadyExists) {
                throw new Error("OTP already sent it please check in the inbox")
            }
            const otp = generateOTP();
            const expiryDate = new Date(Date.now() + 5 * 60 * 1000);

            await this.emailService.sendOtpEmail(email, type, otp);

            await this.otpRepository.setOtp(email as string, otp, type, role, expiryDate, undefined);

            return true

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            console.log("email in otp service", email)
            const otpData = await this.otpRepository.getOtpData(email, type, role);

            if (!otpData) {
                throw new Error('No OTP found');
            }

            if (otpData.otpExpiry.getTime() < Date.now()) {
                await this.otpRepository.clearOtp(email, type, role);
                throw new Error("OTP has expired. Please request a new one.");
            }

            const isMatch = await verifyHashedOTP(otpData.otp, otp);
            console.log(otpData.otp, otp)
            if (!isMatch) {
                throw new Error("Invalid OTP provided.");
            }

            const decryptData = encryptToData(otpData.encryptData)

            if (role === "user") {
                const data = await this.userRepository.create(decryptData as IUser)

                await this.cartService.createCart(data.email as string)
            } else {
                await this.vendorRepository.createVendor(decryptData as IVendor as CreateVendorDTO)
            }


            await this.otpRepository.clearOtp(email, type, role);
            return true;
        } catch (error: any) {
            console.error(error.message)
            throw errorResponse(error.message)
        }
    }

    async passwordVerifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            console.log("emial in otp service", email)
            const otpData = await this.otpRepository.getOtpData(email, type, role);

            if (!otpData) {
                throw new Error('No OTP found');
            }

            if (otpData.otpExpiry.getTime() < Date.now()) {
                await this.otpRepository.clearOtp(email, type, role);
                throw new Error("OTP has expired. Please request a new one.");
            }

            const isMatch = await verifyHashedOTP(otpData.otp, otp);
            console.log(otpData.otp, otp)
            if (!isMatch) {
                throw new Error("Invalid OTP provided.");
            }

            await this.otpRepository.clearOtp(email, type, role);
            return true;
        } catch (error: any) {
            console.error(error.message)
            throw errorResponse(error.message)
        }
    }
    async verifyEmailOTP(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean> {
        try {
            console.log("emial in otp service", email)
            const otpData = await this.otpRepository.getOtpData(email, type, role);

            if (!otpData) {
                throw new Error('No OTP found');
            }

            if (otpData.otpExpiry.getTime() < Date.now()) {
                await this.otpRepository.clearOtp(email, type, role);
                throw new Error("OTP has expired. Please request a new one.");
            }

            const isMatch = await verifyHashedOTP(otpData.otp, otp);
            console.log(otpData.otp, otp)
            if (!isMatch) {
                throw new Error("Invalid OTP provided.");
            }

            await this.otpRepository.clearOtp(email, type, role);
            return true;
        } catch (error: any) {
            console.error(error.message)
            throw errorResponse(error.message)
        }
    }

    async getOtp(email: string, otp: OtpType, role: RoleType): Promise<IOtpData | null> {
        return this.otpRepository.getOtpData(email, otp, role)
    }
}