import { inject } from "inversify";
import { IVendorService } from "@/services/interface";
import {
    controller,
    httpGet,
    httpPatch,
    httpPost,
    httpPut,
    request,
    response
} from "inversify-express-utils";
import { Request, Response } from "express";
import { VENDOR } from "@/types";
import { IVendor } from "@/models/vendors/interface";
import { AuthGuard } from "@/decorators/AuthGuard";
import { BlockGuard } from "@/decorators/BlockGurad";
import { Role } from "@/constants";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";

@controller("/vendor")
export class VendorController {

    constructor(
        @inject(VENDOR.VendorService)
        private readonly vendorService: IVendorService<IVendor>
    ) {}

    @httpGet("/")
    @AuthGuard(Role.ADMIN)
    async getVendors(req: Request, res: Response) {
        try {
            const { search, page, limit, isApproved, isRejected } = req.query;
            const vendors = await this.vendorService.getVendors(
                search as string,
                Number(page) || 1,
                Number(limit) || 5,
                isApproved === "true",
                isRejected === "true"
            );
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendors, "Vendor list retrieved successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPost("/")
    @BlockGuard(Role.VENDOR)
    async createVendor(@request() req: Request, @response() res: Response) {
        try {
            const vendorData = req.body;
            const newVendor = await this.vendorService.createVendor(vendorData);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(newVendor, "Vendor created successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPut("/:id")
    @AuthGuard(Role.VENDOR)
    @BlockGuard(Role.VENDOR)
    async updateVendor(@request() req: Request, @response() res: Response) {
        try {
            const vendorId = req.params.id;
            const vendorData = req.body;
            const updatedVendor = await this.vendorService.editVendor(vendorId, vendorData);

            if (!updatedVendor) {
                return res
                    .status(HttpStatusCode.Ok)
                    .json(errorResponse("Vendor not found"));
            }

            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(updatedVendor, "Vendor updated successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.ADMIN)
    async getVendorById(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.getVendorById(req.params.id);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendor, "Vendor retrieved successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPatch("/block/:id")
    @AuthGuard(Role.ADMIN)
    async blockVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.blockVendor(req.params.id);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendor, "Vendor blocked successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPatch("/unblock/:id")
    @AuthGuard(Role.ADMIN)
    async unblockVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.unblockVendor(req.params.id);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendor, "Vendor unblocked successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPatch("/approve/:id")
    @AuthGuard(Role.ADMIN)
    async approveVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.approveVendor(req.params.id);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendor, "Vendor approved successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }

    @httpPatch("/reject/:id")
    @AuthGuard(Role.ADMIN)
    async rejectVendor(req: Request, res: Response) {
        try {
            const vendor = await this.vendorService.rejectVendor(req.params.id);
            return res
                .status(HttpStatusCode.Ok)
                .json(successResponse(vendor, "Vendor rejected successfully"));
        } catch (error: any) {
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(errorResponse(error.message));
        }
    }
}
