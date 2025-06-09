import { inject, injectable } from "inversify";
import { IOrderService } from "@/services/interface";
import { IOrder } from "@/interface/order/order.interface";
import { IOrderRepository } from "@/repository/order/interface/order.interface";
import { ORDER } from "@/types/orders";
import { CATEGORY, PaginationResponse, PRODUCT, USER, VARIANT, VENDOR, WALLET } from "@/types";
import { UserRepository } from '@/repository/users/implements/users.repository';
import { ADDRESS } from "@/types/address";
import { AddressRepository } from "@/repository/address/implement/address.repository";
import { CART } from "@/types/cart";
import { ICartRepository } from "@/repository/cart/interface/ICart.interfac";
import { Cart } from "@/interface/cart/cart.interface";
import { IProductsRepository } from "@/repository/products/interface/product.repo.interface";
import { IVendor } from "@/models/vendors/interface";
import { IVariantRepository, IVendorRepository } from "@/repository/vendor/interface";
import { errorResponse } from "@/utils";
import { IUserWalletRepository, IVendorWalletRepository } from "@/repository/wallet/interface";
import { ICategoryRepository } from "@/repository/category/interface/ICategory.interface";
import { COMMISION_RATE, ReturnOrderStatus, OrderStatus, OrderPaymentStatus, OrderPaymentMethods } from "@/constants";
import { COUPON } from "@/types/coupon";
import { ICouponRepository } from "@/repository/coupon/interface/coupon.repository";
import { ICouponUsageRepository } from "@/repository/coupon/interface/coupon-usage.repository";
import { dateFormat } from "@/utils/date-format.utils";

@injectable()
export class OrderService implements IOrderService {
    constructor(
        @inject(ORDER.OrderRepository) private readonly orderRepository: IOrderRepository<IOrder>,
        @inject(USER.UserRepository) private readonly userRepository: UserRepository,
        @inject(ADDRESS.addressRepository) private readonly addressRepository: AddressRepository,
        @inject(CART.cartRepository) private readonly cartRepository: ICartRepository<Cart>,
        @inject(PRODUCT.ProductRepository) private readonly productRepository: IProductsRepository,
        @inject(VARIANT.VariantRepository) private readonly variantRepository: IVariantRepository,
        @inject(VENDOR.VendorRepository) private readonly vendorRepository: IVendorRepository<IVendor>,
        @inject(WALLET.VendorWalletRepository) private readonly vendorWalletRepository: IVendorWalletRepository,
        @inject(CATEGORY.categoryRepository) private readonly categoryRepository: ICategoryRepository,
        @inject(WALLET.UserWalletRepositroy) private readonly userWalletRepository: IUserWalletRepository,
        @inject(COUPON.CouponRepository) private readonly couponRepository: ICouponRepository,
        @inject(COUPON.CouponUsageRepository) private readonly couponUsageRepository: ICouponUsageRepository
    ) { }

    private handleError(message: string): never {
        throw errorResponse(message);
    }

    private async validateUser(userId: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) this.handleError("User not found");
        return user;
    }

    private async validateOrder(orderId: string | string, fetchDetails: boolean = false, userId?: string) {
        const order = fetchDetails
            ? await this.orderRepository.getOrderDetails(userId!, orderId as string)
            : await this.orderRepository.getOrderByOrderId(orderId);
        if (!order) this.handleError("Order not found");
        return order;
    }

    private async validateOrderItem(order: IOrder, sku: string) {
        const item = order.orderItems.find(data => data.sku === sku);
        if (!item) this.handleError("Item not found");
        return item;
    }

    private async findAddressById(userId: string, addressId: string) {
        const address = await this.addressRepository.getAddressesByUserId({ userId });
        if (!address) this.handleError("Address not found");
        const selectedAddress = address.address.find(data => data._id.toString() === addressId);
        if (!selectedAddress) this.handleError("Address not found");
        return selectedAddress;
    }

    private async validateCartAndItems(userId: string) {
        const orderItems = await this.cartRepository.getAllCartByUserId(userId);
        if (!orderItems) this.handleError("Cart not found");
        return orderItems;
    }

    private async validateProductAndStock(sku: string, productId: string) {
        const variant = await this.variantRepository.findVariant(sku);
        if (!variant) this.handleError("Variant is not found");

        const stockEntry = variant.values.find(v => v.sku === sku);
        const product = await this.productRepository.getProductById(productId);
        if (!product) this.handleError("Product not found");

        const category = await this.categoryRepository.findOne({ name: product.category });
        if (product.isBlocked || category?.isBlocked) {
            this.handleError(`${product.name} Is Currently Unavailable`);
        }

        if (!stockEntry || stockEntry.stock <= 0) {
            this.handleError(`Product ${product.name} with ${stockEntry?.sku} is out of stock`);
        }

        return { product, variant };
    }

    async getAllOrderByUserId(userId: string, page: number, limit: number, search: string | null): Promise<PaginationResponse<IOrder>> {
        const user = await this.validateUser(userId);
        const skip = (page - 1) * limit;
        const query: { userId: string, orderId?: { $regex: RegExp } } = { userId }

        if (search && search.trim() !== "") {
            query.orderId = { $regex: new RegExp(search) };
        }


        const userAllOrders = await this.orderRepository.getAllOrderByUser(user._id, skip, limit, query);
        if (!userAllOrders) this.handleError("Order not found");
        return userAllOrders;
    }

    async getOrderByUserId(userId: string): Promise<any> {
        const user = await this.validateUser(userId);
        const list = await this.orderRepository.getOrderByUserId(user._id);
        if (!list) this.handleError("Orders not found");
        return list;
    }

    async createOrder(userId: string, orderData: any): Promise<IOrder> {
        const user = await this.validateUser(userId);
        const address = await this.findAddressById(user._id, orderData.shippingAddress);
        const orderItems = await this.validateCartAndItems(user._id);

        const couponName = orderData.couponCode ? orderData.couponCode : null;

        let coupon = null;
        let couponIsUsaged = null;

        if (couponName) {
            coupon = await this.couponRepository.findOne({ name: couponName })

            if (!coupon) {
                throw new Error("Coupon not found")
            }

            if (coupon.expireOn.getTime() <= Date.now()) {
                throw new Error("Coupon exired")
            }

            couponIsUsaged = await this.couponUsageRepository.findOne({ userId, name: coupon.name })

            if (!couponIsUsaged) {
                throw new Error("Invalid coupon applied");
            }

        }

        await Promise.all(orderItems.items.map(async (item) => {
            await this.validateProductAndStock(item.sku, item.productId);
        }));

        const shippingCost = 0;
        const subtotal = orderItems.totalAmount;
        const isCoupon = coupon ? coupon?.offerPrice : 0
        const totalAmount = (subtotal + shippingCost);
        let commision = 0;
        const commisionRate = COMMISION_RATE;
        let payoutAfterCoupon = 0;


        const enrichedItems = await Promise.all(orderItems.items.map(async (item) => {
            const { product } = await this.validateProductAndStock(item.sku, item.productId);
            const vendor = product.vendorId as IVendor;
            if (vendor.isBlocked) this.handleError(`Product ${product.name} is Currently Unavailable`);

            let commisionAmount = 0;
            let payout = item.subTotal

            if (!coupon) {
                commisionAmount = Math.floor(item.subTotal * commisionRate);
                payout = item.subTotal - commisionAmount;
                commision += commisionAmount;
            } else {
                payoutAfterCoupon = (coupon.offerPrice * (item.subTotal / (totalAmount - shippingCost)))
                payout = Math.round(payout - payoutAfterCoupon);
                commisionAmount = 0;
            }
            if (orderData.paymentStatus === OrderPaymentStatus.PAID) {
                const updatedVariant = await this.variantRepository.updateStockCount(item.sku, -item.quantity);
                const stock = updatedVariant?.values.find(v => v.sku === item.sku);
                if (!stock) this.handleError("Out of stock or SKU not found");
            }

            if (orderData.paymentMethod === OrderPaymentMethods.ONLINE) {
                await this.vendorWalletRepository.credit(vendor._id.toString(), payout)
            }

            if (orderData.paymentMethod === OrderPaymentMethods.WALLET) {
                await this.vendorWalletRepository.credit(vendor._id.toString(), payout)
                await this.userWalletRepository.debet(userId, totalAmount)
            }

            return {
                productId: item.productId,
                quantity: item.quantity,
                price: (item.subTotal / item.quantity),
                image: item.image || null,
                productName: product.name,
                sku: item.sku,
                payout,
                commisionAmount,
                userId: user._id.toString(),
                vendorId: vendor._id?.toString(),
            };
        }));


        let newOrder: any = {}

        switch (orderData.paymentMethod) {
            case "COD":
                newOrder = {
                    userId,
                    orderItems: enrichedItems,
                    totalAmount: totalAmount - isCoupon,
                    subtotal,
                    shippingCost,
                    commision,
                    status: "",
                    orderedDate: dateFormat(),
                    couponApplied: !!couponIsUsaged,
                    couponCode: coupon?.name,
                    couponDiscount: coupon?.offerPrice,
                    shippingAddress: address,
                    paymentMethod: orderData.paymentMethod,
                };
                break;
            case "online":

                newOrder = {
                    userId,
                    orderItems: enrichedItems,
                    totalAmount: totalAmount - isCoupon,
                    subtotal,
                    shippingCost,
                    commision,
                    couponApplied: !!couponIsUsaged,
                    couponCode: coupon?.name,
                    couponDiscount: coupon?.offerPrice,
                    shippingAddress: address,
                    orderedDate: dateFormat(),
                    paymentMethod: orderData.paymentMethod,
                    paymentId: orderData.payment_id ? orderData.payment_id : null,
                    paymentStatus: orderData.paymentStatus
                };
                break;
        }


        const createdOrder = await this.orderRepository.createOrder(newOrder);
        await this.cartRepository.clearCart(user._id);
        return createdOrder;
    }

    async getOrderSummary(id: string): Promise<IOrder | null> {
        const order = await this.orderRepository.getOrderById(id);
        if (!order) return null;
        const { price, status, orderedDate } = order as any;
        return { price, status, orderedDate } as unknown as any;
    }

    async updateStatus(sku: string, orderId: string, status: OrderStatus): Promise<IOrder> {
        const order = await this.validateOrder(orderId);
        const orderItem = await this.orderRepository.getOneOrderBySKU(sku, order.orderId);
        if (!orderItem) this.handleError("Order item not found");

        const currentStatus = orderItem.itemStatus;
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
            [OrderStatus.CANCELLED]: [],
            [OrderStatus.RETURNED]: [],
        };

        if (!validTransitions[currentStatus].includes(status)) {
            this.handleError(`Invalid status transition from ${currentStatus} to ${status}`);
        }

        const updatedStatus = await this.orderRepository.updateOneItem(sku, orderId, status);
        if (!updatedStatus) this.handleError("Error during update order status");

        const updatedOrder = await this.validateOrder(orderId);
        const allItems = updatedOrder.orderItems.every(data => data.itemStatus === status);

        if (allItems) {
            if (status === OrderStatus.DELIVERED) {
                try {
                    await Promise.all(
                        updatedOrder.orderItems.map(async (data) => {
                            console.log("vendor need cash payout is: ", data.payout);
                            await this.vendorWalletRepository.credit(data.vendorId, data.payout);
                        })
                    );

                    updatedOrder.paymentStatus = OrderPaymentStatus.PAID;
                    if (updatedOrder.paymentMethod === OrderPaymentMethods.WALLET) {
                        await this.userWalletRepository.debet(updatedOrder.userId, updatedOrder.totalAmount);
                    }
                } catch (error) {
                    console.error("Error processing wallet operations:", error);
                    this.handleError("Failed to process payouts");
                }
            }
            updatedOrder.status = status;
        }

        const finalOrder = await this.orderRepository.updateOrder(updatedOrder.orderId, updatedOrder);
        if (!finalOrder) this.handleError("Order update failed");
        return finalOrder;
    }

    async getOrderDetails(userId: string, orderId: string): Promise<IOrder> {
        await this.validateUser(userId);
        return this.validateOrder(orderId, true, userId);
    }

    async getOrderByVendor(vendorId: string, page: number, limit: number, search: string): Promise<PaginationResponse<IOrder>> {
        const vendor = await this.vendorRepository.getVendorById(vendorId);
        if (!vendor) this.handleError("Seller not found");

        const query: any = { "orderItems.vendorId": vendorId }

        if (search && search.trim() !== "") {
            query.orderId = { $regex: new RegExp(search) };
        }


        const skip = (page - 1) * limit;
        const result = await this.orderRepository.getAllOrderByVendor(vendor._id, skip, limit, query);
        if (!result) this.handleError("Order is Empty");
        return result;
    }

    async cancelOrder(id: string): Promise<IOrder | null> {
        return await this.orderRepository.cancelOrderById(id);
    }

    async cancelOrderOneItem(userId: string, orderId: string, itemOrderId: string, reason: string): Promise<IOrder> {
        const order = await this.validateOrder(orderId, true, userId);
        const item = order.orderItems.find(item => item._id?.toString() === itemOrderId);
        if (!item) this.handleError("Item not found in the order");

        if (!["processing", "shipped"].includes(item.itemStatus)) {
            this.handleError("Item cannot be cancelled at this stage");
        }

        item.itemStatus = OrderStatus.CANCELLED;
        item.cancelReason = reason;
        order.commision -= item.commisionAmount;
        item.commisionAmount = 0;
        let itemTotal = (item.price * item.quantity);
        let coupon = await this.couponRepository.findOne({ name: order.couponCode });
        const offerPrice = coupon?.offerPrice ?? 0;

        if (coupon && order.couponApplied && order.totalAmount - itemTotal <= coupon.min_price) {
            order.totalAmount = (order.totalAmount - itemTotal) - offerPrice;
            itemTotal -= coupon.offerPrice;
        } else {
            order.totalAmount -= (itemTotal - offerPrice);
        }


        if (order.paymentMethod === OrderPaymentMethods.ONLINE || order.paymentMethod === OrderPaymentMethods.WALLET) {
            await this.vendorWalletRepository.debet(item.vendorId, itemTotal - offerPrice);
            await this.userWalletRepository.credit(item.userId, itemTotal - offerPrice)
        }

        const activeItems = order.orderItems.filter(data => ["shipped", "processing"].includes(data.itemStatus));
        if (activeItems.length === 0) {
            order.status = OrderStatus.CANCELLED;
            order.paymentStatus = OrderPaymentStatus.CANCELLED;
        }

        order.couponApplied = false;
        order.couponCode = undefined;
        order.couponDiscount = 0;


        console.log(item.quantity, item.sku)
        await this.variantRepository.updateStockCount(item.sku, item.quantity);
        const updatedOrder = await this.orderRepository.updateOrder(order.orderId, order);
        if (!updatedOrder) this.handleError("Error during updated order");
        return updatedOrder;
    }

    async returnOrder(orderId: string, returnReason: string): Promise<IOrder> {
        return this.validateOrder(orderId);
    }

    async createReturnRequest(userId: string, orderId: string, reason: string, sku: string): Promise<IOrder> {
        await this.validateUser(userId);
        const order = await this.validateOrder(orderId);
        const item = await this.validateOrderItem(order, sku);

        item.returnStatus = ReturnOrderStatus.PENDING;
        item.returnReason = reason;
        item.returnRequestedAt = new Date();

        const updatedOrder = await this.orderRepository.updateOrder(orderId, order);
        if (!updatedOrder) this.handleError("Order update failed");
        return updatedOrder;
    }

    async approveReturnRequest(orderId: string, sku: string, reason: string): Promise<IOrder> {
        const order = await this.validateOrder(orderId);
        const item = await this.validateOrderItem(order, sku);


        item.returnStatus = ReturnOrderStatus.APPROVED;
        item.returnApprovedAt = new Date();
        item.returnComment = reason ?? undefined;
        item.itemStatus = OrderStatus.RETURNED

        order.commision -= item.commisionAmount;

        if (order.orderItems.length === 1) {
            order.status = OrderStatus.RETURNED
            order.paymentStatus = OrderPaymentStatus.REFUNDED
        }

        const isAllReturned = order.orderItems.every(data => data.itemStatus === OrderStatus.RETURNED)

        if (isAllReturned) {
            order.status = OrderStatus.RETURNED
            order.paymentStatus = OrderPaymentStatus.REFUNDED
        }

        const variant = await this.variantRepository.updateStockCount(item.sku, item.quantity)

        if (!variant) {
            this.handleError("Variant not found");
        }

        await this.vendorWalletRepository.debet(item.vendorId, item.payout);
        await this.userWalletRepository.credit(item.userId, item.payout + item.commisionAmount);


        const updatedOrder = await this.orderRepository.updateOrder(orderId, order);
        if (!updatedOrder) this.handleError("Order update failed");
        return updatedOrder;
    }

    async rejectReturnRequest(orderId: string, sku: string, reason: string): Promise<IOrder> {
        const order = await this.validateOrder(orderId);
        const item = await this.validateOrderItem(order, sku);

        item.returnStatus = ReturnOrderStatus.REJECTED
        item.returnRejectedAt = new Date();
        item.returnComment = reason;

        const updateOrder = await this.orderRepository.updateOrder(orderId, order);

        if (!updateOrder) {
            this.handleError("Order update failed");
        }

        return updateOrder;

    }

    async getReturnStatus(orderId: string, vendorId: string): Promise<IOrder> {
        return this.validateOrder(orderId);
    }
}