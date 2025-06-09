import { injectable } from "inversify";
import { IAdminAuthRepository } from "../interface/auth-admin.interface";
import { IAdmin } from "@/models/admins/interface";
import { Admin } from "@/models/admins/implements";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class AdminAuthRepository extends BaseRepository<IAdmin>{
    constructor() {
        super(Admin);
    }
}