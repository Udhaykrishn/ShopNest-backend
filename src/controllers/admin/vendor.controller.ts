import { Request, Response } from "express";
import { controller, httpGet, httpPatch } from "inversify-express-utils";
import { inject } from "inversify";
import { successResponse, errorResponse } from "@/utils";
import { IAdminVendorService } from "@/services/interface/admin-vendor.interface";
import { ADMINVENDOR } from "@/types";
import { AuthGuard, Role } from "@/decorators/AuthGuard";

@controller("/admin/vendors")
export class AdminVendorController {
    constructor(@inject(ADMINVENDOR.AdminVendorService) private vendorService: IAdminVendorService) { }

    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getVendors(req: Request, res: Response) {
        try {
            const { search, page, limit, isApproved, isRejected } = req.query;
            const vendors = await this.vendorService.getVendors(
                search as string,
                Number(page) || 1,
                Number(limit) || 10,
                isApproved === "true",
                isRejected === "true"
            );
            res.json(successResponse(vendors, "Vendors retrieved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.ADMIN)
    async getVendorById(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.getVendorById(req.params.id);
            res.json(successResponse(vendor, "Vendor retrieved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/block/:id")
    @AuthGuard(Role.ADMIN)
    async blockVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.blockVendor(req.params.id);
            res.json(successResponse(vendor, "Vendor blocked successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unblockVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.unblockVendor(req.params.id);
            res.json(successResponse(vendor, "Vendor unblocked successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/approve/:id")
    @AuthGuard(Role.ADMIN)
    async approveVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.approveVendor(req.params.id);
            res.json(successResponse(vendor, "Vendor approved successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }

    @httpPatch("/reject/:id")
    @AuthGuard(Role.ADMIN)
    async rejectVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.rejectVendor(req.params.id);
            res.json(successResponse(vendor, "Vendor rejected successfully"));
        } catch (error: any) {
            res.status(400).json(errorResponse(error.message));
        }
    }
}
