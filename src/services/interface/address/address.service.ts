import { IAddress, AddressItem } from "@/interface/address/address.interface";


type ResponseAddress<T = IAddress> = Promise<T>;

export type AddressParams = {
    userId: string;
    addressId?: string;
};

export interface IAddressService {
    addAddress(params: Pick<AddressParams, 'userId'>, data: AddressItem): ResponseAddress;
    updateAddress(params: AddressParams, data: Partial<AddressItem>): ResponseAddress;
    getOneAddress(params: AddressParams): ResponseAddress<AddressItem>
    deleteAddress(params: AddressParams): ResponseAddress;
    getAllAddress(params: Pick<AddressParams, "userId">): ResponseAddress
    updateAddress(params: AddressParams, data: Partial<AddressItem>): ResponseAddress
    setDefaultAddress(params: AddressParams): ResponseAddress
}