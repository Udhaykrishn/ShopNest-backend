import { CouponController } from '@/controllers/coupon';
import { CouponUsageRepository } from '@/repository/coupon/implements/coupon-usage.repository';
import { CouponRepository } from '@/repository/coupon/implements/coupon.repository';
import { CouponService } from '@/services/implements/coupon';
import { COUPON } from '@/types/coupon';
import { ContainerModule } from 'inversify';

export const CouponModule = new ContainerModule((bind) => {
    bind<CouponController>(COUPON.CouponController).to(CouponController);
    bind<CouponService>(COUPON.CouponService).to(CouponService);
    bind<CouponRepository>(COUPON.CouponRepository).to(CouponRepository);
    bind<CouponUsageRepository>(COUPON.CouponUsageRepository).to(CouponUsageRepository)
})