import { IOffers } from "@/interface/offers";
import { PaginationResponse } from "@/types";

export interface IOfferService {
    create(data: Partial<IOffers>): Promise<IOffers>
    update(offerId: string, data: Partial<IOffers>): Promise<IOffers>
    findCoupon(page: number, limit: number, search: string): Promise<PaginationResponse<IOffers> | null>
}