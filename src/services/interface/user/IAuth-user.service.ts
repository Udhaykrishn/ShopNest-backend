import { OtpType, RoleType } from "@/constants";
import { CreateUserDTO, LoginUserDto } from "@/dtos/users";
import { Response } from "express";

export interface IAuthService<T> {
    login(data: LoginUserDto): Promise<Record<string, string>>
    signup(data: CreateUserDTO): Promise<string>
    logout(res:Response): Promise<boolean>
    profile(id: string): Promise<T | null>
    googleAuth(credential: any): Promise<any | null>
    verifyOtp(email: string, otp: string, type: OtpType, role: RoleType): Promise<boolean>;
    sendOtp(data: CreateUserDTO, type: OtpType, role: RoleType): Promise<boolean>;
    sendOneOtp(email: string, type: OtpType, role: RoleType): Promise<any>
}