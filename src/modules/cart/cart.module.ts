
import { CartController } from '@/controllers/cart/cart.controller';
import { CartRepository } from '@/repository/cart/implement/cart.repository';
import { CartServices } from '@/services/implements/cart/cart.services';
import { CART } from '@/types/cart';
import { ContainerModule } from 'inversify';

export const CartModule = new ContainerModule((bind) => {
    bind<CartController>(CART.cartController).to(CartController);
    bind<CartServices>(CART.cartService).to(CartServices);
    bind<CartRepository>(CART.cartRepository).to(CartRepository)
})