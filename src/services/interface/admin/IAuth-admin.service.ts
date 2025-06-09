import { AdminLoginDTO } from "@/dtos/admin/admin.dto";
import { IAdmin } from "@/models/admins/interface";
import { Response } from "express";

export interface IAdminAuthService {
    login(data: AdminLoginDTO): Promise<Record<string, string>>
    logout(res: Response): Promise<boolean>
    profile(id: string): Promise<IAdmin | null>
}