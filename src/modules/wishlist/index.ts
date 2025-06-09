import { WishlistControler } from '@/controllers/wishlist';
import { WishlistRepository } from '@/repository/wishlist/implement/wishlist.repository';
import { WishlistService } from '@/services/implements/wishlist/wishlist.service';
import { WISHLIST } from "@/types/wishlist"
import { ContainerModule } from 'inversify';

export const WishlistModule = new ContainerModule((bind) => {
    bind<WishlistControler>(WISHLIST.wishlistController).to(WishlistControler);
    bind<WishlistService>(WISHLIST.wishlistService).to(WishlistService);
    bind<WishlistRepository>(WISHLIST.wishlistRepository).to(WishlistRepository)
})