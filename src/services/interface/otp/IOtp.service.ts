import { OtpType, RoleType } from "@/constants";
import { CreateUserDTO } from "@/dtos/users";
import { IOtpData } from "@/models/users/interface";

export interface IOtpService {
    sendOTP(data: Partial<CreateUserDTO>, type: OtpType, role: RoleType): Promise<boolean>
    sendOneOTP(email: string, type: OtpType, role: RoleType): Promise<any>
    verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>
    passwordVerifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>
    getOtp(email: string, otp: OtpType, role: RoleType): Promise<IOtpData | null>
    verifyEmailOTP(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>
}