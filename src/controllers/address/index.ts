import { Role } from "@/constants";
import { AuthGuard, BlockGuard } from "@/decorators";
import { AddressCreateDTO, AddressUpdateDTO } from "@/dtos/address";
import { validateRequest } from "@/middleware/validation.middleware";
import { IAddressService } from "@/services/interface/address/address.service";
import { ADDRESS } from "@/types/address";
import { errorResponse, successResponse } from "@/utils";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpDelete, httpGet, httpPatch, httpPost, httpPut, request, response } from "inversify-express-utils";

@controller("/address")
export class AddressController {
    constructor(@inject(ADDRESS.addressService) private readonly addressService: IAddressService) {
    }

    private getAddressParams(req: Request, includeAddressId: boolean = true) {
        return {
            userId: req.user?.id as string,
            ...(includeAddressId && { addressId: req.params.id })
        }
    }

    @httpPost("/", validateRequest(AddressCreateDTO))
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async createAddress(@request() req: Request, @response() res: Response) {
        try {
            const address = await this.addressService.addAddress(this.getAddressParams(req, false), req.body)
            
            return res.status(HttpStatusCode.Created).json(successResponse(address))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPatch("/default/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async setDefault(@request() req: Request, @response() res: Response) {
        try {
            const setDefaultAddress = await this.addressService.setDefaultAddress(this.getAddressParams(req))
            return res.status(HttpStatusCode.Ok).json(successResponse(setDefaultAddress))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpPut("/:id", validateRequest(AddressUpdateDTO))
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async updateAddress(@request() req: Request, @response() res: Response) {
        try {
            const updatedAddress = await this.addressService.updateAddress(this.getAddressParams(req), req.body)

            return res.status(HttpStatusCode.Created).json(successResponse(updatedAddress))
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message))
        }
    }

    @httpGet("/")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getAllAddress(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.addressService.getAllAddress(this.getAddressParams(req));
            return res.status(HttpStatusCode.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpGet("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async getOneAddress(@request() req: Request, @response() res: Response) {
        try {
            const address = await this.addressService.getOneAddress(this.getAddressParams(req));
            return res.status(HttpStatusCode.Ok).json(successResponse(address));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }

    @httpDelete("/:id")
    @AuthGuard(Role.USER)
    @BlockGuard(Role.USER)
    async deleteAddress(@request() req: Request, @response() res: Response) {
        try {
            const result = await this.addressService.deleteAddress(this.getAddressParams(req));
            return res.status(HttpStatusCode.Ok).json(successResponse(result));
        } catch (error: any) {
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse(error.message));
        }
    }


}