import { injectable } from "inversify";
import { IOtpData } from "@/models/users/interface";
import { OTP } from "@/models/users/implements";
import { IOtpRepository } from "../interface/otp.interface";
import { OtpType, RoleType } from "@/constants";

@injectable()
export class OtpRepository implements IOtpRepository {
    async setOtp(email: string, otp: string, type: OtpType, role: RoleType, expiryDate: Date, encryptData: string): Promise<IOtpData> {
        await OTP.deleteOne({ email, type, role });

        return await OTP.create({
            email,
            otp,
            role,
            type,
            otpExpiry: expiryDate,
            encryptData
        })
    }

    async getOtpData(email: string, type: OtpType, role: RoleType): Promise<IOtpData | null> {
        return OTP.findOne({ email, type, role })
    }

    async clearOtp(email: string, type: OtpType, role: RoleType): Promise<void> {
        await OTP.deleteOne({ email, type, role })
    }
}