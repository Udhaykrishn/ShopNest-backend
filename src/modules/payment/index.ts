import { PaymentController } from "@/controllers/payment";
import { PaymentService } from "@/services/implements/payment";
import { PAYMENT } from "@/types/payment";
import { ContainerModule } from "inversify";


export const PaymentModule = new ContainerModule((bind) => {
    bind<PaymentController>(PAYMENT.PaymentController).to(PaymentController),
    bind<PaymentService>(PAYMENT.PaymentService).to(PaymentService)
});
