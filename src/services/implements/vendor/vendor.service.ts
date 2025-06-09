import { injectable, inject } from "inversify";
import { IVendorService } from "@/services/interface";
import { PaginationResponse, VENDOR } from "@/types";
import { IVendor } from "@/models/vendors/interface/vendor.interface";
import { CreateVendorDTO } from "@/dtos/vendor/vendor.dto";
import { IVendorRepository } from "@/repository/vendor/interface";

@injectable()
export class VendorService implements IVendorService<IVendor> {

    constructor(@inject(VENDOR.VendorRepository) private readonly vendorRepository: IVendorRepository<IVendor>) {
    }

    async createVendor(vendorData: CreateVendorDTO): Promise<IVendor> {
        return await this.vendorRepository.createVendor(vendorData);
    }

    async editVendor(vendorId: string, vendorData: Partial<IVendor>): Promise<IVendor> {
        const updatedVendor = await this.vendorRepository.updateVendor(vendorId, vendorData);
        if (!updatedVendor) {
            throw new Error("Vendor not found");
        }
        return updatedVendor;
    }

    async deleteVendor(vendorId: string): Promise<void> {
        await this.vendorRepository.deleteVendor(vendorId);
    }

    async getVendorById(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepository.getVendorById(vendorId);
        if (!vendor) {
            throw new Error("Vendor not found");
        }
        return vendor;
    }

    async blockVendor(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepository.blockVendor(vendorId);
        if (!vendor) {
            throw new Error("Vendor not found");
        }
        return vendor;
    }

    async unblockVendor(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepository.unblockVendor(vendorId);
        if (!vendor) {
            throw new Error("Vendor not found");
        }
        return vendor;
    }

    async approveVendor(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepository.approveVendor(vendorId);
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        
        return vendor;
    }

    async rejectVendor(id: string): Promise<IVendor> {

        const updatedVendor = await this.vendorRepository.rejectVendor(id);

        if (!updatedVendor) {
            throw new Error("Vendor not found");
        }

        return updatedVendor
    }

    async getVendors(
        search?: string,
        page = 1,
        limit = 5,
        isApproved?: boolean,
        isRejected?: boolean,
    ): Promise<PaginationResponse<IVendor>> {
        const data = await this.vendorRepository.getAllVendors(search, page, limit, isApproved, isRejected);
        return data;
    }


    async getAllApprovedVendors(): Promise<IVendor[]> {
        return this.vendorRepository.getVendorsByApprovalStatus("active");
    }

}
