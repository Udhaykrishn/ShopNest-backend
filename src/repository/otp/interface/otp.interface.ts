import { OtpType, RoleType } from "@/constants";
import { IOtpData } from "@/models/users/interface";

export interface IOtpRepository {
    setOtp(email: string, otp: string, type: OtpType, role: RoleType, expiryDate: Date, encryptData: string | undefined): Promise<IOtpData>;
    getOtpData(email: string, type: OtpType, role: RoleType): Promise<IOtpData | null>
    clearOtp(email: string, type: OtpType, role: RoleType): Promise<void>
}