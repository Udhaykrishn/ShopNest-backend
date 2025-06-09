import { CouponDTO } from "@/dtos/coupon";
import { ICoupon } from "@/interface/coupon";
import { PaginationResponse } from "@/types";
import { DeleteResult } from "mongoose";

export interface ICouponService{
    findCoupon(page:number,limit:number,search:string):Promise<PaginationResponse<ICoupon>>
    create(data:CouponDTO):Promise<ICoupon>
    update(couponId:string,data:Partial<ICoupon>):Promise<ICoupon>
    delete(couponId:string):Promise<ICoupon>
    apply(userId:string,couponId:string,amount:number):Promise<ICoupon>
    validCoupons(amount:number):Promise<ICoupon[]>
    removeCoupon(userId:string,couponName:string):Promise<DeleteResult>
}