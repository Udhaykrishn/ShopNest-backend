import { Schema, model } from "mongoose";
import encrypt from "mongoose-encryption";
import { config } from "@/config";
import { IAddress } from "@/interface/address/address.interface";

export interface AddressDocument extends IAddress,Document {};

const addressItemSchema = new Schema({
  type: { type: String, required: true, encrypted: true },
  street: { type: String, required: true, encrypted: true },
  landmark: { type: String, encrypted: true },
  city: { type: String, required: true, encrypted: true },
  state: { type: String, required: true, encrypted: true },
  pincode: { type: String, required: true, encrypted: true },
  country: { type: String, required: true, encrypted: true },
  district: { type: String, required: true, encrypted: true },
  isDefault: { type: Boolean, default: false, encrypted: true },
  phone: { type: String, required: true, trim: true, encrypted: true },
  name: { type: String, required: true, trim: true, encrypted: true },
});

const addressSchema = new Schema<AddressDocument>({
  userId: { type: String, required: true, unique: true },
  address: { type: [addressItemSchema], default: [] },
}, { timestamps: true });

const sigKey = config.SIGN_KEY;
const encKey = config.CRYTPO_SECRET;

addressItemSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: [
    "type", "street", "landmark", "city", "state", "pincode",
    "country", "district", "isDefault", "phone", "name"
  ]
});

export const Address = model<AddressDocument>("Address", addressSchema);
