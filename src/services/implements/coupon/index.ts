import { CouponDTO } from "@/dtos/coupon";
import { ICoupon } from "@/interface/coupon";
import { ICouponUsageRepository } from "@/repository/coupon/interface/coupon-usage.repository";
import { ICouponRepository } from "@/repository/coupon/interface/coupon.repository";
import { ICouponService } from "@/services/interface/coupon";
import { PaginationResponse } from "@/types";
import { COUPON } from "@/types/coupon";
import { errorResponse } from "@/utils";
import { inject, injectable } from "inversify";
import { DeleteResult } from "mongoose";


@injectable()
export class CouponService implements ICouponService {

    constructor(
        @inject(COUPON.CouponRepository) private readonly couponRepository: ICouponRepository,
        @inject(COUPON.CouponUsageRepository) private readonly couponUsageRepository: ICouponUsageRepository
    ) {

    }

    async create(data: CouponDTO): Promise<ICoupon> {
        try {
            data.name = data.name.trim()
            const coupon = await this.couponRepository.findOne({ name: data.name })

            if (coupon) {
                throw new Error("Coupon already exists")
            }

            if (!data.name) {
                throw new Error("Name is required")
            }


            if (data.min_price < 1000) {
                throw new Error("Minimum price should be greater than 1000")
            }

            if (data.offerPrice < 100) {
                throw new Error("Offer price should be greater than 100")
            }

            const newCoupon = await this.couponRepository.create(data)

            return newCoupon
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }


    async update(couponId: string, data: Partial<ICoupon>): Promise<ICoupon> {
        try {
            const coupon = await this.couponRepository.findById(couponId)

            if (!coupon) {
                throw new Error("Coupon not found")
            }

            const updatedCoupon = await this.couponRepository.update(couponId, data)

            if (!updatedCoupon) {
                throw new Error("Coupon updating failed")
            }

            return updatedCoupon

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async delete(couponId: string): Promise<ICoupon> {
        try {
            const coupon = await this.couponRepository.findById(couponId)

            if (!coupon) {
                throw new Error("Coupont not found")
            }

            const deletedCoupon = await this.couponRepository.delete(couponId)

            if (!deletedCoupon) {
                throw new Error("Coupon deleted failed")
            }

            return deletedCoupon
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async apply(userId: string, couponName: string, amount: number): Promise<ICoupon> {
        try {
            console.log("coupon name is: ", couponName)
            const coupon = await this.couponRepository.findOne({ name: couponName })

            console.log("coupoin is getting or not: ", coupon)

            if (!coupon) {
                throw new Error("Coupon not found")
            }

            if (coupon.isBlocked) {
                throw new Error(`Unable to use ${coupon.name}, Remove and procced`)
            }

            if (coupon.expireOn.getTime() <= Date.now()) {
                throw new Error("Coupon was expired")
            }

            if (coupon.min_price > amount) {
                throw new Error(`You need to spend at least ₹${coupon.min_price} to use this coupon.`);
            }

            const isUserAlreadyApplied = await this.couponUsageRepository.findOne({ userId, name: coupon.name })

            if (isUserAlreadyApplied) {
                throw new Error("You have already used this coupon")
            }

            await this.couponUsageRepository.create({ userId, name: coupon.name })

            return coupon

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async validCoupons(amount: number): Promise<ICoupon[]> {
        try {
            return await this.couponRepository.validCoupons(amount);
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async findCoupon(page: number, limit: number, search: string): Promise<PaginationResponse<ICoupon>> {
        try {
            const query: any = {};

            if (search && search.trim() !== "") {
                query.name = { $regex: new RegExp(search), $options: "i" };
            }


            const skip = (page - 1) * limit;

            const coupons = await this.couponRepository.findAllCoupons(skip, limit, query)

            if (!coupons) {
                throw new Error("coupons not found")
            }

            return coupons;

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }


    async removeCoupon(userId: string, couponName: string): Promise<DeleteResult> {
        try {
            const coupon = await this.couponRepository.findOne({ name: couponName })
            if (!coupon) {
                throw new Error("Coupon not found");
            }

            const couponUsage = await this.couponUsageRepository.findOne({ name: couponName, userId });

            if (!couponUsage) {
                throw new Error("Coupon not applied");
            }

            return await this.couponUsageRepository.remove(userId, couponName)

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

}