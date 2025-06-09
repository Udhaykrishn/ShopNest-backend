import { IAddressRepository } from "../interface/address.repository";
import { Address } from "@/models/address/address.model";
import { IAddress, AddressItem } from "@/interface/address/address.interface";
import { injectable } from "inversify";
import { AddressParams } from "@/services/interface/address/address.service";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class AddressRepository extends BaseRepository<any> implements IAddressRepository {
    constructor(){
        super(Address)
    } 
    
    async createAddress(params: Pick<AddressParams, "userId">): Promise<IAddress | null> {
        return await Address.create({
            userId: params.userId
        });
    }

    async getAddressesByUserId(params: Pick<AddressParams, "userId">): Promise<IAddress | null> {
        return await Address.findOne({ userId: params.userId });
    }

    async addAddressToUser(params: Pick<AddressParams, "userId">, data: AddressItem): Promise<IAddress | null> {
        return await Address.findOneAndUpdate(
            { userId: params.userId },
            {
                $push: { address: data },
                $set: { updatedAt: new Date() }
            },
            { new: true, upsert: true }
        );
    }

    async updateAddressById(params: AddressParams, data: Partial<AddressItem>): Promise<IAddress | null> {
        const updateFields: Record<string, any> = {};

        (Object.keys(data) as (keyof AddressItem)[]).forEach((key) => {
            const values = data[key]
            if (values !== undefined) {
                updateFields[`address.$.${key}`] = values;
            }
        });

        return await Address.findOneAndUpdate({
            userId: params.userId,
            "address._id": params.addressId
        }, {
            $set: updateFields
        }, {
            new: true
        })
    }

    async updateSetDefault(params: AddressParams): Promise<IAddress | null> {
        await Address.updateOne(
            {
                userId: params.userId
            },
            { $set: { "address.$[elem].isDefault": false } },
            { arrayFilters: [{ "elem.isDefault": true }] }
        );

        const updatedDoc = await Address.findOneAndUpdate(
            {
                userId: params.userId, "address._id": params.addressId
            },
            {
                $set: { "address.$.isDefault": true }
            },
            {
                new: true
            }
        )

        return updatedDoc;
    }


    async deleteUserAddress(params: AddressParams): Promise<IAddress | null> {
        return await Address.findOneAndUpdate(
            { userId: params.userId },
            {
                $pull: { 'address': { _id: params.addressId } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );
    }
}
