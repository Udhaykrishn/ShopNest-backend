import { ErrorMessages } from "@/constants/error.constant";
import { IOffers } from "@/interface/offers";
import { IOfferRepository } from "@/repository/offers/interface/offer.repository";
import { IOfferService } from "@/services/interface/offers";
import { CATEGORY, OFFERS, PaginationResponse } from "@/types";
import { handleAsync } from "@/utils/error-handler";
import { inject, injectable } from "inversify";
import { OfferDiscountRange, OfferStatus } from "@/constants";
import { ICategoryRepository } from "@/repository/category/interface/ICategory.interface";

@injectable()
export class OfferService implements IOfferService {
    constructor(
        @inject(OFFERS.OfferRepository) private readonly offerRepository: IOfferRepository,
        @inject(CATEGORY.categoryRepository) private readonly categoryRepository: ICategoryRepository
    ) {

    }

    private async ensureOfferDoesNotExist(category: string): Promise<void> {
        const existingOffer = await this.offerRepository.findOne({ category });
        if (existingOffer) {
            throw new Error(ErrorMessages.OFFER_ALREADY_EXISTS);
        }
    }

    private validateOfferData(data: IOffers): void {
        if (data.start_date >= data.end_date) {
            throw new Error(ErrorMessages.OFFER_START_DATE_AFTER_END_DATE);
        }

        if (data.discount < OfferDiscountRange.MIN_RANGE || data.discount > OfferDiscountRange.MAX_RANGE) {
            throw new Error(ErrorMessages.OFFER_DISCOUNT_OUT_OF_RANGE);
        }

        if (data.discount >= data.original_price) {
            throw new Error(ErrorMessages.OFFER_DISCOUNT_EXCEEDS_ORIGINAL_PRICE);
        }
    }

    // Lazy evaluation: Update status if needed
    private async updatedOffers() {
        return await this.offerRepository.bulkUpdateStatus();
    }

    async create(data: IOffers): Promise<IOffers> {
        return handleAsync(async () => {


            const category = await this.categoryRepository.findOne({ name: data.category });
            if (!category) {
                throw new Error(ErrorMessages.CATEGORY_NOT_FOUND)
            }

            await this.ensureOfferDoesNotExist(data.category);


            this.validateOfferData(data);

            return this.offerRepository.create(data)
        })
    }


    async update(offerId: string, data: Partial<IOffers>): Promise<IOffers> {
        return handleAsync(async () => {
            console.log("how working")
            const offer = await this.offerRepository.findById(offerId);

            if (!offer) throw new Error(ErrorMessages.OFFER_NOT_FOUND);

            const category = await this.categoryRepository.findOne({ name: offer.category })

            if (!category) {
                throw new Error(ErrorMessages.CATEGORY_NOT_FOUND)
            }

            const currentDate = new Date();

            if (data.isBlocked) {
                data.status = OfferStatus.BLOCKED;
                category.offer = 0;
            } else {
                if (offer.end_date < currentDate) {
                    data.status = OfferStatus.EXPIRED;
                } else if (offer.start_date > currentDate) {
                    data.status = OfferStatus.PENDING;
                } else {
                    data.status = OfferStatus.ACTIVE;
                    category.offer = data.discount ? data.discount : 0
                }
            }

            const updated = await this.offerRepository.update(offerId, data);
            
            if (!updated) throw new Error(ErrorMessages.OFFER_UPDATE_FAILED);
            const categoryUpdate = await this.categoryRepository.update(category._id as string, category) 
            if (!categoryUpdate) throw new Error(ErrorMessages.CATEGORY_FAILED_TO_UPDATE)

            return updated;
        });
    }


    async findCoupon(page: number, limit: number, search: string): Promise<PaginationResponse<IOffers>> {
        const skip = (page - 1) * limit;


        const { data, total } = await handleAsync(async () => {
            const query: any = {};

            if (search && search.trim() !== "") {
                query.name = { $regex: new RegExp(search), $options: "i" };
            }

            await this.updatedOffers();

            console.log("query is: ", query)

            const allPaginatedOffers = await this.offerRepository.findAllOffers(skip, limit, query)

            if (!allPaginatedOffers) {
                throw new Error(ErrorMessages.OFFER__FAILED_TO_GET)
            }

            return allPaginatedOffers
        })

        return {
            data,
            total
        }

    }
}