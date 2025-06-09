import { IAddress, AddressItem } from "@/interface/address/address.interface";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { AddressParams } from "@/services/interface/address/address.service";

type ResponseAddress<T = IAddress> = Promise<T | null>

export interface IAddressRepository extends IBaseRepository<IAddress> {
  createAddress(params: Pick<AddressParams, "userId">): ResponseAddress
  getAddressesByUserId(params: Pick<AddressParams, "userId">): ResponseAddress
  addAddressToUser(params: Pick<AddressParams, "userId">, data: AddressItem): ResponseAddress
  deleteUserAddress(params: AddressParams): ResponseAddress
  updateAddressById(params: AddressParams, data: Partial<AddressItem>): ResponseAddress
  updateSetDefault(params: AddressParams): ResponseAddress
}
