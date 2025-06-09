import { OrderStatus } from "@/constants";
import { ISalesRepository } from "../interface";
import { Order } from "@/models/orders/order.model";
import { User } from "@/models/users/implements";
import { Vendor } from "@/models/vendors/implements";
import { Product } from "@/models/vendors/implements/product.model"

export class SalesRepository implements ISalesRepository {
    async orderAmountWithCount(filter: any = {}): Promise<any> {
        const totalAmount = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },
            {
                $group: { _id: null, sum: { $sum: "$totalAmount" }, count: { $sum: 1 } }
            },
            { $project: { _id: 0 } }
        ]);

        return totalAmount.length !== 0 ? totalAmount[0] : { sum: 0, count: 0 };
    }

    async orderStatus(filter: any = {}): Promise<any> {
        const orderCountWithStatus = await Order.aggregate([
            { $match: { ...filter } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        return orderCountWithStatus;
    }

    async overAllDiscount(filter: any = {}): Promise<any> {
        const totalDiscount = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { couponApplied: true },
                        { discount: { $lt: 0 } }
                    ],
                    status: OrderStatus.DELIVERED,
                    ...filter
                }
            },
            {
                $group: {
                    _id: null,
                    totalCouponAmount: { $sum: "$couponDiscount" },
                    totalDiscountAmount: { $sum: "$discount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: {
                        $add: ["$totalCouponAmount", "$totalDiscountAmount"]
                    }
                }
            }
        ]);
        return totalDiscount.length !== 0 ? totalDiscount[0].totalAmount : 0;
    }

    async totalSales(filter: any = {}): Promise<any> {
        const totalSales = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },
            { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: "$totalAmount" } } }
        ]);


        return totalSales.length !== 0 ? totalSales[0] : { sum: 0, count: 0 };

    }

    async totalRevenue(filter: any = {}): Promise<any> {
        const result = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },
            { $group: { _id: null, revenue: { $sum: "$commision" } } },
            { $project: { _id: 0 } }
        ]);
        return result[0]?.revenue || 0;
    }

    async totalProductsCount(): Promise<any> {
        return await Product.countDocuments();
    }


    async bestSellCategory(filter: any = {}): Promise<any> {
        const topSellCategory = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },

            { $unwind: "$orderItems" },

            {
                $addFields: {
                    productObjectId: {
                        $convert: {
                            input: "$orderItems.productId",
                            to: "objectId",
                            onError: null,
                            onNull: null
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "products",
                    localField: "productObjectId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },

            { $unwind: "$productInfo" },

            {
                $group: {
                    _id: "$productInfo.category",
                    totalSold: { $sum: 1 },
                    totalRevenue: { $sum: "$orderItems.price" }
                }
            },

            { $sort: { totalSold: -1 } },

            { $limit: 10 },

            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return topSellCategory;
    }

    async bestTopProudcts(filter: any = {}): Promise<any> {
        const bestProducts = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productName",
                    total: { $sum: 1 },
                    orderId: { $first: "$orderId" },
                    price: { $first: "$orderItems.price" },
                    orderedDate:{$first:"$orderedDate"},
                    quantity: { $first: "$orderItems.quantity" },
                    image: { $first: "$orderItems.image" },
                    status: { $first: "$orderItems.itemStatus" },
                }
            },
            { $sort: { total: -1 } },
            {
                $project: {
                    _id: 0,
                    productName: "$_id",
                    orderId: { $toLong: "$orderId" },
                    orderedDate:1,
                    price: 1,
                    quantity: 1,
                    status: 1,
                    total: 1,
                    image: 1
                }
            },
            { $limit: 10 }
        ]);
        return bestProducts;
    }

    async totalUsersAndVendorCount(): Promise<any> {
        const users_count = await User.countDocuments();
        const vendors_count = await Vendor.countDocuments();
        return { users_count, vendors_count };
    }


    async highestPaidVendor(filter: any = {}): Promise<any> {
        const bestPayoutVendor = await Order.aggregate([
            { $match: { status: OrderStatus.DELIVERED, ...filter } },
            { $unwind: "$orderItems" },
            {
                $addFields: {
                    "orderItems.vendorObjId": {
                        $toObjectId: "$orderItems.vendorId"
                    }
                }
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "orderItems.vendorObjId",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
            { $unwind: "$vendorDetails" },
            {
                $group: {
                    _id: "$orderItems.vendorId",
                    payout: { $sum: "$orderItems.payout" },
                    vendor: { $first: "$vendorDetails" }
                }
            },
            {
                $project: {
                    _id: 0,
                    payout: "$payout",
                    vendor_name: "$vendor.username",
                    vendor_email: "$vendor.email"
                }
            },
            { $sort: { payout: -1 } },
            { $limit: 10 }
        ]);

        return bestPayoutVendor;
    }

    async vendorRevenue(vendorId: string, dateFilter?: any): Promise<any> {
        const result = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { "orderItems.vendorId": vendorId, ...dateFilter } },
            { $group: { _id: null, revenue: { $sum: "$orderItems.payout" } } },
            { $project: { _id: 0, revenue: 1 } }
        ]);

        return result[0]?.revenue || 0
    }


    async topSellProductByVendor(vendorId: string, dateFilter?: any): Promise<any> {
        const bestSelledProduct = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { "orderItems.vendorId": vendorId, status: OrderStatus.DELIVERED, ...dateFilter } },
            {
                $group: {
                    _id: "$orderItems.productName",
                    count: { $sum: 1 },
                    price: { $first: "$orderItems.price" },
                    orderId: { $first: "$orderItems.orderId" },
                    status: { $first: "$orderItems.itemStatus" },
                    quantity: { $first: "$orderItems.quantity" }
                }
            },
            {
                $sort: { count: -1, price: -1 }
            }
        ])

        return bestSelledProduct
    }

    async vendorOrderCount(vendorId: string, dateFilter?: any): Promise<any> {
        const ordersCount = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { "orderItems.vendorId": vendorId, status: OrderStatus.DELIVERED, ...dateFilter } },
            { $group: { _id: 0, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ])

        return ordersCount[0].count;
    }

    async vendorTotalProducts(vendorId: string): Promise<any> {
        return await Product.countDocuments({ vendorId }).lean()
    }

    async vendorOrderWithStatus(vendorId: string, dateFilter?: any): Promise<any> {
        const orderCountWithStatus = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { "orderItems.vendorId": vendorId, ...dateFilter } },
            { $group: { _id: "$orderItems.itemStatus", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ])

        return orderCountWithStatus
    }
}