import { OtpType } from "@/constants";

export interface IEmailService {
    sendOtpEmail(email: string, type: OtpType, otp: string): Promise<void>;
    sendProductStatusEmail(email: string, type: OtpType, productName: string): Promise<void>;
    sendVendorApprovalEmail(email: string, type: OtpType): Promise<void>;
    verifyConnection(): Promise<boolean>;
}