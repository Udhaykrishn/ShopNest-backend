import { ISalesRepository } from "@/repository/sales/interface";
import { SALES } from "@/types/sales";
import { inject } from "inversify";

export interface ISaleService {
    admin(date: string, start: string, end: string): Promise<DashboardData>;
    vendor(date: string, start: string, end: string, vendorId: string): Promise<any>;
}

interface DashboardData {
    revenue: number;
    products: number;
    topProducts: any[];
    totalSales: any;
    orderCount: any;
    discount: any;
    rolesCount: any;
    highestPaidVendor: any;
    bestSellCategory: any;
}

export class SaleService implements ISaleService {
    constructor(
        @inject(SALES.SalesRepository) private readonly salesRepository: ISalesRepository,
    ) { }

    private getDateFilter(date: string, start: string, end: string): any {
        if (start !== "undefined" && end !== "undefined") {
            const startDate = new Date(start);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);
            return {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            };
        } else {
            const now = new Date();
            let startDate: Date | null = null;

            switch (date) {
                case "daily":
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case "weekly":
                    startDate = new Date(now);
                    const dayOfWeek = now.getDay(); 
                    startDate.setDate(now.getDate() - dayOfWeek); 
                    startDate.setHours(0, 0, 0, 0); 
                    break;
                case "monthly":
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case "yearly":
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }

            return startDate
                ? { createdAt: { $gte: startDate } }
                : {};
        }
    }
    async admin(date: string, start: string, end: string): Promise<DashboardData> {
        const dateFilter = this.getDateFilter(date, start, end);
        const [
            totalSales,
            orderStatusCount,
            overallDiscount,
            revenue,
            productCount,
            topProducts,
            rolesCount,
            highestPaidVendor,
            bestSellCategory,
        ] = await Promise.all([
            this.salesRepository.orderAmountWithCount(dateFilter),
            this.salesRepository.orderStatus(dateFilter),
            this.salesRepository.overAllDiscount(dateFilter),
            this.salesRepository.totalRevenue(dateFilter),
            this.salesRepository.totalProductsCount(),
            this.salesRepository.bestTopProudcts(dateFilter),
            this.salesRepository.totalUsersAndVendorCount(),
            this.salesRepository.highestPaidVendor(dateFilter),
            this.salesRepository.bestSellCategory(dateFilter)
        ]);

        return {
            revenue,
            products: productCount,
            topProducts,
            totalSales,
            orderCount: orderStatusCount,
            discount: overallDiscount,
            rolesCount,
            highestPaidVendor,
            bestSellCategory
        };
    }

    async vendor(date: string, start: string, end: string, vendorId: string): Promise<any> {
        const dateFilter = this.getDateFilter(date, start, end);

        const [vendorRevenue, vendorOrders, vendorOrderWithStatus, vendorProductsCount, bestSelledProduct] = await Promise.all([
            this.salesRepository.vendorRevenue(vendorId, dateFilter),
            this.salesRepository.vendorOrderCount(vendorId, dateFilter),
            this.salesRepository.vendorOrderWithStatus(vendorId, dateFilter),
            this.salesRepository.vendorTotalProducts(vendorId),
            this.salesRepository.topSellProductByVendor(vendorId, dateFilter)
        ]);

        return {
            revenue: vendorRevenue,
            orders: vendorOrders,
            status: vendorOrderWithStatus,
            products: vendorProductsCount,
            bestProduct: bestSelledProduct
        };
    }
}
