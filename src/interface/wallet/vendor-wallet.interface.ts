import { Document } from "mongoose";

export enum paymentType {
    "CREDIT" = "credit",
    "DEBIT" = "debit"
}

interface Transaction {
    amount: number;
    date: Date;
    type: paymentType
}

export interface IBaseWallet extends Document {
    balance: number;
    transactions: Transaction[]
}

export interface IVendorWallet extends IBaseWallet {
    vendorId: string;
}

export interface IUserWallet extends IBaseWallet {
    userId: string;
}