import { CreateVendorDTO } from "@/dtos/vendor/vendor.dto";
import { PaginationResponse } from "@/types";

export interface IVendorRepository<T> {
    createVendor(vendorData: CreateVendorDTO): Promise<T>;
    getVendorById(vendorId: string): Promise<T | null>;
    updateVendor(vendorId: string, vendorData: Partial<T>): Promise<T | null>;
    deleteVendor(vendorId: string): Promise<void>;
    getAllVendors(search?: string, page?: number, limit?: number, isApproved?: boolean, isRejected?: boolean): Promise<PaginationResponse<T>>;
    getVendorsByApprovalStatus(status: string): Promise<T[]>;
    blockVendor(vendorId: string): Promise<T | null>;
    unblockVendor(vendorId: string): Promise<T | null>;
    approveVendor(vendorId: string): Promise<T | null>;
    rejectVendor(vendorId: string): Promise<T | null>
    getVendorByEmail(email: string): Promise<T | null>
}
