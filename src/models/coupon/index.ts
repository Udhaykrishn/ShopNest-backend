import { ICoupon, ICouponUsage } from "@/interface/coupon";
import { model, Schema } from "mongoose";

export interface CouponDocument extends ICoupon, Document { }
export interface CouponUsageDocument extends ICouponUsage, Document { };

const couponSchema = new Schema<CouponDocument>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
        required: true
    },
    expireOn: {
        type: Date,
        required: true,
        index:true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    min_price: {
        type: Number,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
})


couponSchema.statics.getValidCoupons = function () {
    return this.find({
        expireOn: { $gt: new Date() },
        isBlocked: false
    });
};

const couponUsageSchema = new Schema<CouponUsageDocument>({
    userId: { type: String, ref: "Users", required: true },
    name: { type: String, ref: "Coupon", required: true },
    usedAt: { type: Date, default: Date.now }
})

couponSchema.pre(/^find/, async function (next) {
    await Coupon.updateMany(
      { expireOn: { $lt: new Date() }, isExpired: false },
      { $set: { isExpired: true } }
    );
    next();
  });

export const CouponUsage = model<CouponUsageDocument>("CouponUsage", couponUsageSchema);

export const Coupon = model<CouponDocument>("Coupon", couponSchema)