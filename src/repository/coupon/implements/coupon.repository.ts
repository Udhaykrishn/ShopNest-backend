import { Coupon, CouponDocument } from "@/models/coupon";
import { BaseRepository } from "@/repository/base.repository";
import { ICouponRepository } from "../interface/coupon.repository";
import { ICoupon } from "@/interface/coupon";
import { PaginationResponse } from "@/types";

export class CouponRepository extends BaseRepository<CouponDocument> implements ICouponRepository {
    constructor() {
        super(Coupon)
    }

    async findAllCoupons(skip: number, limit: number, query: any): Promise<PaginationResponse<ICoupon> | null> {
        const coupons = await Coupon.find(query).skip(skip).limit(limit)
        const total = await Coupon.countDocuments();

        return { data: coupons, total }
    }

    async validCoupons(amount: number): Promise<ICoupon[]> {
        return await Coupon.find({ isBlocked: false, min_price: { $lte: amount }, expireOn: { $gt: new Date() } });
    }
}

