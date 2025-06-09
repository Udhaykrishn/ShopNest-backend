import { injectable } from "inversify";
import { Vendor as VendorModel } from "@/models/vendors/implements";
import { IVendorRepository } from "../interface";
import { IVendor } from "@/models/vendors/interface";
import { CreateVendorDTO } from "@/dtos/vendor/vendor.dto";
import { PaginationResponse } from "@/types";

@injectable()
export class VendorRepository implements IVendorRepository<IVendor> {

    async getAllVendors(
        search?: string,
        page = 1,
        limit = 10,
        isApproved?: boolean,
        isRejected?: boolean,
    ): Promise<PaginationResponse<IVendor>> {
        const cleanSearch = search ? search.trim().replace(/^"|"$/g, '') : '';

        let filter: any = {};

        if (cleanSearch) {
            filter.email = { $regex: `^${cleanSearch}`, $options: 'i' };
        }

        if (typeof isApproved !== 'undefined') {
            filter.isApproved = isApproved;
        }

        if (typeof isRejected !== "undefined") {
            filter.isRejected = isRejected;
        }
        const skip = (page - 1) * limit;

        const [vendors, total] = await Promise.all([
            VendorModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }).select('-password'),
            VendorModel.countDocuments(filter)
        ]);

        return { data: vendors, total };
    }


    async createVendor(vendorData: CreateVendorDTO): Promise<IVendor> {
        const vendor = new VendorModel(vendorData);
        return vendor.save();
    }

    async getVendorByEmail(email: string): Promise<IVendor | null> {
        return VendorModel.findOne({ email })
    }

    async getVendorById(vendorId: string): Promise<IVendor | null> {
        return VendorModel.findById(vendorId).select('-password')
    }

    async updateVendor(vendorId: string, vendorData: Partial<IVendor>): Promise<IVendor | null> {
        return VendorModel.findByIdAndUpdate(vendorId, vendorData, { new: true, runValidators: true });
    }

    async deleteVendor(vendorId: string): Promise<void> {
        await VendorModel.findByIdAndDelete(vendorId);
    }

    async getVendorsByApprovalStatus(status: string): Promise<IVendor[]> {
        return VendorModel.find({ approvalStatus: status });
    }

    async blockVendor(vendorId: string): Promise<IVendor | null> {
        return VendorModel.findByIdAndUpdate(vendorId, { isBlocked: true, }, { new: true });
    }

    async unblockVendor(vendorId: string): Promise<IVendor | null> {
        return VendorModel.findByIdAndUpdate(vendorId, { isBlocked: false }, { new: true });
    }

    async approveVendor(vendorId: string): Promise<IVendor | null> {
        return VendorModel.findByIdAndUpdate(vendorId, { approvalStatus: "active", isApproved: true }, { new: true });
    }

    async rejectVendor(vendorId: string): Promise<IVendor | null> {
        return VendorModel.findByIdAndUpdate(vendorId, { approvalStatus: "reject", isRejected: true }, { new: true });
    }
}
