import { CreateVendorDTO } from "@/dtos/vendor/vendor.dto";
import { PaginationResponse } from "@/types";

export interface IVendorService<T> {
    createVendor(vendorData: CreateVendorDTO): Promise<T>;
    editVendor(vendorId: string, vendorData: Partial<T>): Promise<T>;
    deleteVendor(vendorId: string): Promise<void>;
    getVendorById(vendorId: string): Promise<T>;
    blockVendor(vendorId: string): Promise<T>;
    unblockVendor(vendorId: string): Promise<T>;
    approveVendor(vendorId: string): Promise<T>;
    rejectVendor(id: string): Promise<T>;
    getVendors(search?: string, page?: number, limit?: number, isApproved?: boolean, isRejected?: boolean): Promise<PaginationResponse<T>>;
    getAllApprovedVendors(): Promise<T[]>;
}
