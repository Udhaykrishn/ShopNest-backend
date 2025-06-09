import { CouponUsage, CouponUsageDocument } from "@/models/coupon";
import { BaseRepository } from "@/repository/base.repository";
import { ICouponUsageRepository } from "../interface/coupon-usage.repository";
import { DeleteResult } from "mongoose";

export class CouponUsageRepository extends BaseRepository<CouponUsageDocument> implements ICouponUsageRepository {
    constructor() {
        super(CouponUsage)
    }

    async remove(userId: string, couponName: string): Promise<DeleteResult> {
        return  await CouponUsage.deleteOne({ userId, name:couponName })
    }
}