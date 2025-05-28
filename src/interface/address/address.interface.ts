export interface AddressItem {
    _id: string;
    type: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault?: boolean;
    phone: string;
    name: string;
    district: string
}

export interface IAddress {
    userId: string;
    address: AddressItem[];
}
