import { ContainerModule } from "inversify";
import { USER } from "@/types";
import {
    EmailService,
    OtpService
} from "@/services/implements";
import { OtpRepository } from "@/repository/otp/implements/otp.repository";


export const OtpModule = new ContainerModule((bind) => {
    bind<OtpService>(USER.OTPService).to(OtpService)
    bind<OtpRepository>(USER.OTPRepository).to(OtpRepository)
    bind<EmailService>(USER.EmailService).to(EmailService)
});
