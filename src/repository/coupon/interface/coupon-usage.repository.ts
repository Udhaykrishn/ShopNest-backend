import { ICouponUsage } from "@/interface/coupon";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { DeleteResult } from "mongoose";

export interface ICouponUsageRepository extends IBaseRepository<ICouponUsage>{
    remove(userId:string,couponName:string):Promise<DeleteResult>
}