import { OrderStatus } from "@/constants";

export interface ISalesRepository {
  orderStatus(dateFilter?: any): Promise<{ _id: string; count: number }[]>;
  orderAmountWithCount(dateFilter?: any): Promise<{ sum: number; count: number }>;
  totalSales(dateFilter?: any): Promise<{ count: number; sum: number }[]>;
  overAllDiscount(dateFilter?: any): Promise<{ totalAmount: number }[]>;
  totalUsersAndVendorCount(dateFilter?: any): Promise<{ users_count: number; vendors_count: number }>;
  totalProductsCount(dateFilter?: any): Promise<number>;
  totalRevenue(dateFilter?: any): Promise<number>;
  highestPaidVendor(dateFilter?: any): Promise<{ payout: number; vendor_name: string; vendor_email: string }[]>;
  bestTopProudcts(dateFilter?: any): Promise<{ productName: string, price: number, quantity: number, status: OrderStatus, total: number }[]>;
  bestSellCategory(dataFilter?: any): Promise<any>
  vendorRevenue(vendorId: string, dateFilter?: any): Promise<any>
  vendorOrderCount(vendorId: string, dateFilter?: any): Promise<any>
  topSellProductByVendor(vendorId: string, dateFilter?: any,): Promise<any>
  vendorTotalProducts(vendorId: string, dateFilter?: any): Promise<any>
  vendorOrderWithStatus(vendorId: string, dateFilter?: any): Promise<any>
}