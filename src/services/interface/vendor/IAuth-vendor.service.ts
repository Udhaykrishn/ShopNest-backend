import { CreateVendorDTO, LoginVendorDTO } from "@/dtos/vendor/vendor.dto"
import { OtpType, RoleType } from "@/constants"

export interface IAuthVendorService<T> {
    login(data: LoginVendorDTO): Promise<Record<string, string>>
    signup(data: CreateVendorDTO): Promise<boolean>
    logout(): Promise<void>
    profile(vendor: Record<string, unknown>): Promise<T>
    sendOtp(email: string, type: OtpType, role: RoleType): Promise<boolean>
    resendOtp(email: string, type: OtpType, role: RoleType): Promise<void>
    verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>
    forgotPassword(email: string, type: OtpType, role: RoleType): Promise<void>
    verifyForgotPassword(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>
    verifyEmail(email:string):Promise<{email:string}>
    updatePassword(email:string,password:string):Promise<void>
}