import { ICoupon } from "@/interface/coupon";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from "@/types";

export interface ICouponRepository extends IBaseRepository<ICoupon> {
    findAllCoupons(skip:number,limit:number,query:any):Promise<PaginationResponse<ICoupon> | null>
    validCoupons(amount:number):Promise<ICoupon[]>
}