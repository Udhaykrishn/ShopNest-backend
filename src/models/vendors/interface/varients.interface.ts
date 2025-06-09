import { Document } from "mongoose";

export interface IVariant extends Document {
    _id: string;
    type: string;
    values: IVariantValue[];
    productId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IVariantValue {
    value: string;
    price: number;
    offeredPrice: number,
    stock: number;
    sku?: string;
}