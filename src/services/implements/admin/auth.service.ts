import { injectable, inject } from "inversify";
import { IAdminAuthService } from "@/services/interface";
import { AdminLoginDTO } from "@/dtos/admin/admin.dto";
import { ADMIN } from "@/types";
import { IAdminAuthRepository } from "@/repository/admin/interface";
import { IAdmin } from "@/models/admins/interface";
import { clearAuthCookie, errorResponse, getPayload, hashToBePassword, validateExists } from "@/utils";
import { jwtSign } from "@/utils/jwt.util";
import { Response } from "express";
import { ErrorMessages } from "@/constants/error.constant";

@injectable()
export class AdminAuthService implements IAdminAuthService {
    constructor(@inject(ADMIN.AuthAdminRepository) private readonly adminAuthRepository: IAdminAuthRepository<IAdmin>) {
    }
    async login({ email, password }: AdminLoginDTO): Promise<Record<string, string>> {
        try {
            let exists = await this.adminAuthRepository.findOne({email})
            const validateAdmin = validateExists(exists,"Admin not found")

            const isPasswordMatch = await hashToBePassword(validateAdmin.password, password)

            validateExists(isPasswordMatch,ErrorMessages.INVALID_CREDENTIALS)

            const payload = await getPayload(exists)

            const token = jwtSign(payload)

            return { token };

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async logout(res: Response):Promise<boolean> {
        try {
            await clearAuthCookie(res,"user_auth_token")
                                                          
            return true;
        } catch (error:any) {
            throw errorResponse(error.message)
        }
    }

    async profile(id: string): Promise<IAdmin | null> {
        const admin = await this.adminAuthRepository.findById(id)
        if (!admin) {
            throw new Error("Admin not found!, Please login")
        }
        return admin;
    }
}