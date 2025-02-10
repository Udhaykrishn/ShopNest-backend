import { IUser } from "@/interface/users.interface";

export interface IUserRepository {
    getUser(): Promise<IUser>
    updateOTP(email: string, otp: string, otpExpires: Date): Promise<void>
}