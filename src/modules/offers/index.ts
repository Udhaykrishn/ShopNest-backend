import { OfferController } from '@/controllers/offers';
import { OfferRepository } from '@/repository/offers/implement';
import { OfferService } from '@/services/implements/offers';
import { OFFERS } from '@/types';
import { ContainerModule } from 'inversify';
export const OfferModule = new ContainerModule((bind) => {
    bind<OfferController>(OFFERS.OfferController).to(OfferController)
    bind<OfferService>(OFFERS.OfferService).to(OfferService)
    bind<OfferRepository>(OFFERS.OfferRepository).to(OfferRepository)
})