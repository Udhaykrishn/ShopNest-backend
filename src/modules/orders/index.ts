import { OrderController } from '@/controllers/orders/orders.controller';
import { OrderService } from '@/services/implements/order/orders.service';
import { OrderRepository } from '@/repository/order/implement/order.repository';
import { ORDER } from '@/types/orders';
import { ContainerModule } from 'inversify';
import { InvoiceService } from '@/services/implements/invoice';

export const OrderModule = new ContainerModule((bind) => {
    bind<OrderController>(ORDER.OrderController).to(OrderController);
    bind<OrderService>(ORDER.OrderService).to(OrderService);
    bind<OrderRepository>(ORDER.OrderRepository).to(OrderRepository);
    bind<InvoiceService>(ORDER.InvoiceService).to(InvoiceService)
});
