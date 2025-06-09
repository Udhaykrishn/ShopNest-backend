import { model, Schema } from "mongoose";
import { IOffers } from "@/interface/offers"
import { OfferStatus, OffersType } from "@/constants";

export const offerSchema = new Schema<IOffers>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: Number,
        min: 100,
        max: 500,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: OffersType,
        required: true,
    },
    status: {
        type: String,
        enum: OfferStatus,
        required: true,
        default: OfferStatus.PENDING
    },
    isBlocked: {
        type: Boolean,
        required: true,
        default: false,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    }
})

export const Offers = model<IOffers>("Offers", offerSchema)