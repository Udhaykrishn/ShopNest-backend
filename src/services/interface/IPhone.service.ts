import { OtpType } from "@/constants";

export interface IPhoneService {
    sendOtp(phone: string, otp: string, type: OtpType): Promise<void>
}