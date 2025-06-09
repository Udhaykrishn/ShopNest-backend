import { IOffers } from "@/interface/offers";
import { BaseRepository } from "@/repository/base.repository";
import { inject, injectable } from "inversify";
import { IOfferRepository } from "../interface/offer.repository";
import { Offers } from "@/models/admins/implements/offer.model";
import { CATEGORY, PaginationResponse } from "@/types";
import { OfferStatus, OrderStatus } from "@/constants";
import { ICategoryRepository } from "@/repository/category/interface/ICategory.interface";

@injectable()
export class OfferRepository extends BaseRepository<IOffers> implements IOfferRepository {
    constructor(
        @inject(CATEGORY.categoryRepository) private readonly categoryRepository: ICategoryRepository
    ) {
        super(Offers)
    }

    async findAllOffers(skip: number, limit: number, query: any): Promise<PaginationResponse<IOffers> | null> {
        const data = await Offers.find(query).skip(skip).limit(limit).lean();
        const total = await Offers.countDocuments();

        return { data, total }
    }
    async bulkUpdateStatus(): Promise<void> {
        const now = new Date();

        await Offers.updateMany(
            {
                status: OfferStatus.PENDING,
                start_date: { $lte: now }
            },
            {
                $set: { status: OfferStatus.ACTIVE }
            }
        );

        await Offers.updateMany(
            {
                status: OfferStatus.ACTIVE,
                end_date: { $lte: now }
            },
            {
                $set: { status: OfferStatus.EXPIRED }
            }
        );

        const activeOffers = await Offers.aggregate([
            {
                $match: {
                    status: OfferStatus.ACTIVE,
                    start_date: { $lte: now },
                    end_date: { $gt: now }
                }
            },
            {
                $project: {
                    category: "$category", 
                    discount: "$discount"
                }
            }
        ]);

        const applyDiscounts = activeOffers.map(offer => ({
            updateOne: {
                filter: { name: offer.category },
                update: { $set: { offer: offer.discount } }
            }
        }));

        const expiredOffers = await Offers.aggregate([
            {
                $match: {
                    status: OfferStatus.EXPIRED,
                    end_date: { $lte: now }
                }
            },
            {
                $project: {
                    category: "$category"
                }
            }
        ]);

        const resetDiscounts = expiredOffers.map(offer => ({
            updateOne: {
                filter: { name: offer.category },
                update: { $set: { offer: 0 } } 
            }
        }));

        const allUpdates = [...applyDiscounts, ...resetDiscounts];


        console.log("bulkwrite all updates",allUpdates)

        if (allUpdates.length > 0) {
            await this.categoryRepository.bulkUpdate(allUpdates);  
        }
    }

}