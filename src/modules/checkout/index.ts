
import { CheckoutController } from '@/controllers/checkout';
import { CheckoutService } from '@/services/implements/checkout';
import { CHECKOUT } from '@/types/checkout';
import { ContainerModule } from 'inversify';

export const CheckoutModule = new ContainerModule((bind) => {
    bind<CheckoutController>(CHECKOUT.checkoutController).to(CheckoutController);
    bind<CheckoutService>(CHECKOUT.checkoutService).to(CheckoutService);
})