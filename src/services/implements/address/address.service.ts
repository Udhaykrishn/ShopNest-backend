import { AddressItem, IAddress } from "@/interface/address/address.interface";
import { IAddressRepository } from "@/repository/address/interface/address.repository";
import { IUserRepository } from "@/repository/users/interface/user.interface";
import { AddressParams, IAddressService } from "@/services/interface/address/address.service";
import { USER } from "@/types";
import { ADDRESS } from "@/types/address";
import { errorResponse, validatePhoneNumber } from "@/utils";
import { inject, injectable } from "inversify";


const ADDRESS_LIMIT_PER_USER = 5


@injectable()
export class AddressService implements IAddressService {

    constructor(
        @inject(ADDRESS.addressRepository) private readonly addressRepository: IAddressRepository,
        @inject(USER.UserRepository) private readonly userRepository: IUserRepository
    ) { }

    private async getUser(id: string) {
        const user = await this.userRepository.getUserById(id)
        if (!user) {
            throw new Error("User not found")
        }
        return user;
    }

    private async create(userId: string) {
        const createAddress = await this.addressRepository.createAddress({ userId })

        if (!createAddress) {
            throw new Error("create address with user failed")
        }

        return createAddress
    }


    private async findAddress(userId: string, isCreate = true) {
        const address = await this.addressRepository.getAddressesByUserId({ userId })

        if (!address) {
            if (isCreate) {
                return await this.create(userId)
            } else {
                throw new Error("Address not found")
            }
        }


        return address
    }

    private findAddressById(findAddress: IAddress, addressId: string) {
        const addressItem = findAddress.address.find(data => data._id.toString() === addressId)

        if (!addressItem) {
            throw new Error("Address not found")
        }

        return addressItem
    }

    async setDefaultAddress(params: AddressParams): Promise<IAddress> {
        const user = await this.getUser(params.userId)

        const address = await this.findAddress(user._id, false)

        const addressId = this.findAddressById(address, params.addressId as string)

        const updatedAddress = await this.addressRepository.updateSetDefault({ userId: user._id, addressId: addressId._id })

        if (!updatedAddress) {
            throw new Error("Failed to update default addressF")
        }

        return updatedAddress

    }



    async addAddress(params: Pick<AddressParams, "userId">, data: AddressItem): Promise<IAddress> {
        try {
            const isValidPhoneNumber = await validatePhoneNumber(data.phone)

            if (!isValidPhoneNumber) {
                throw new Error("Please enter a valid indian phone number")
            }
            const user = await this.getUser(params.userId)


            const findOne = await this.findAddress(params.userId)

            let addressLength = findOne.address.length

            if (addressLength >= ADDRESS_LIMIT_PER_USER) {
                throw new Error("You've saved 5 addresses. Delete one to add a new one.")
            }

            const addAddress = await this.addressRepository.addAddressToUser({ userId: user._id }, data)

            if (!addAddress) {
                throw new Error("Failed to add address")
            }


            return addAddress

        } catch (error: any) {
            console.log(error)
            throw errorResponse(error.message)
        }
    }

    async deleteAddress(params: AddressParams): Promise<IAddress> {
        try {
            const user = await this.getUser(params.userId)

            const findAddress = await this.findAddress(user._id, false)

            const getDeletedAddress = this.findAddressById(findAddress, params.addressId as string)

            const removeAddress = await this.addressRepository.deleteUserAddress({ userId: user._id, addressId: getDeletedAddress._id })

            if (!removeAddress) {
                throw new Error("Failed to remove address")
            }


            return removeAddress
        } catch (error: any) {
            throw errorResponse(error.message)
        }

    }
    async updateAddress(params: AddressParams, data: Partial<AddressItem>): Promise<IAddress> {
        try {
            const user = await this.getUser(params.userId)

            const getAddress = await this.findAddress(user._id)

            const findAddressItem = this.findAddressById(getAddress, params.addressId as string)

            const updatedAddress = await this.addressRepository.updateAddressById(params, data)

            if (!updatedAddress) {
                throw new Error("Failed to update address")
            }

            return updatedAddress

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }


    async getOneAddress(params: AddressParams): Promise<AddressItem> {
        try {
            const user = await this.getUser(params.userId)

            const getAddress = await this.findAddress(user._id, false)

            const getAddressItem = this.findAddressById(getAddress, params.addressId as string)

            return getAddressItem
        } catch (error: any) {
            throw errorResponse(error.message)
        }

    }

    async getAllAddress(params: Pick<AddressParams, "userId">): Promise<IAddress> {
        try {
            const user = await this.getUser(params.userId)
            const findAddress = await this.findAddress(user._id, false)
            return findAddress
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }
}