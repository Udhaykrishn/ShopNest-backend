import { WalletController } from '@/controllers/wallet';
import { UserWalletRepository } from '@/repository/wallet/implement/user-wallet.repository';
import { VendorWalletRepository } from '@/repository/wallet/implement/vendor-wallet.repository';
import { UserWalletService } from '@/services/implements/wallet/user-wallet.service';
import { VendorWalletService } from '@/services/implements/wallet/vendor-wallet.service';
import { WALLET } from '@/types';
import { ContainerModule } from 'inversify';

export const WalletModule = new ContainerModule((bind) => {
    bind<VendorWalletRepository>(WALLET.VendorWalletRepository).to(VendorWalletRepository);
    bind<VendorWalletService>(WALLET.VendorWalletService).to(VendorWalletService)
    bind<WalletController>(WALLET.WalletController).to(WalletController)
    bind<UserWalletRepository>(WALLET.UserWalletRepositroy).to(UserWalletRepository)
    bind<UserWalletService>(WALLET.UserWalletService).to(UserWalletService)
})