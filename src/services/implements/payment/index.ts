import { config } from "@/config";
import { OrderPaymentStatus, PaymentConstant } from "@/constants";
import { ErrorMessages } from "@/constants/error.constant";
import { IOrder } from "@/interface/order/order.interface";
import { IOrderRepository } from "@/repository/order/interface/order.interface";
import { IVariantRepository } from "@/repository/vendor/interface";
import { IPaymentService } from "@/services/interface/payment";
import { ORDER, VARIANT } from "@/types";
import { errorResponse } from "@/utils";
import { handleAsync } from "@/utils/error-handler";
import { inject, injectable } from "inversify";
import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";

const instance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_SECRET,
});

@injectable()
export class PaymentService implements IPaymentService {

  constructor(
    @inject(ORDER.OrderRepository) private readonly orderRepository: IOrderRepository<IOrder>,
    @inject(VARIANT.VariantRepository) private readonly variantRepository: IVariantRepository
  ) {

  }

  async create(amount: string): Promise<Orders.RazorpayOrder> {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount)) {
      throw errorResponse(ErrorMessages.PAYMENT_INVALID_AMOUNT);
    }

    const amountInPaise = Math.round(parsedAmount * 100);

    const MAX_PAISE = PaymentConstant.MAX_LIMIT_PRIZE;
    const MIN_PAISE = PaymentConstant.MIN_LIMIT_PRIZE;

    if (amountInPaise > MAX_PAISE) {
      throw errorResponse(ErrorMessages.PAYMENT_MAX_LIMIT_EXCEEDS);
    }

    if (amountInPaise < MIN_PAISE) {
      throw errorResponse(ErrorMessages.PAYMENT_MIN_LIMIT_EXCEEDS);
    }

    try {
      const options = {
        amount: amountInPaise,
        currency: PaymentConstant.PAYMENT_CURRNCY as string,
      };

      const order = await instance.orders.create(options);

      if (!order) {
        throw new Error(ErrorMessages.PAYMENT_ORDER_ID_CREATE_FAILED);
      }

      return order;
    } catch (error: any) {
      console.log(error);
      throw errorResponse(error.message || ErrorMessages.ORDER_PAYMENT_FAILED);
    }
  }



  async retry(paymentId: string, orderId: string): Promise<IOrder> {
    return await handleAsync(async () => {

      const order = await this.orderRepository.findOne({ orderId })

      if (!order) {
        throw new Error(ErrorMessages.ORDER_NOT_FOUND);
      }

      order.paymentStatus = OrderPaymentStatus.PAID
      order.paymentId = paymentId

      const orderItems = order.orderItems

      orderItems.forEach(async (data) => {
        await this.variantRepository.updateStockCount(data.sku, -data.quantity)
      })

      const updateOrder = await this.orderRepository.update(order._id, order)

      if (!updateOrder) {
        throw new Error(ErrorMessages.ORDER_UPDATE_FAILED)
      }

      return order
    })
  }
}
