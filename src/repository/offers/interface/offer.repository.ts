import { IOffers } from "@/interface/offers";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from "@/types";

export interface IOfferRepository extends IBaseRepository<IOffers> {
    findAllOffers(skip: number, limit: number, query: any): Promise<PaginationResponse<IOffers> | null>
    bulkUpdateStatus():Promise<void>;
}