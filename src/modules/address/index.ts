import { ContainerModule } from 'inversify';
import { AddressRepository } from '@/repository/address/implement/address.repository';
import { ADDRESS } from '@/types/address';
import { AddressController } from '@/controllers/address';
import { AddressService } from '@/services/implements/address/address.service';

export const AddressModule = new ContainerModule((bind) => {
    bind<AddressController>(ADDRESS.addressController).to(AddressController);
    bind<AddressService>(ADDRESS.addressService).to(AddressService);
    bind<AddressRepository>(ADDRESS.addressRepository).to(AddressRepository);
});
