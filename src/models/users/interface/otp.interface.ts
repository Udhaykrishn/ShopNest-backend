import { OtpType, RoleType } from "@/constants";


export interface IOtpData {
    email: string;
    otp: string;
    type: OtpType;
    otpExpiry: Date;
    role: RoleType;
    encryptData: string;
}
