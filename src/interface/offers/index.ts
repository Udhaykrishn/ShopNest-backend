import { OffersType, OfferStatus } from "@/constants/offers.constant";
import { Document } from "mongoose";

export interface IOffers extends Document {
    category: string;
    discount: number;
    type: OffersType;
    _id: string;
    original_price: number;
    isBlocked: boolean;
    name: string;
    start_date: Date;
    end_date: Date;
    status: OfferStatus;
}