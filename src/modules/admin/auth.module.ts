import { AdminAuthController } from "@/controllers/admin";
import { AuthController } from "@/controllers/users";
import { AdminAuthRepository } from "@/repository/admin/implements";
import {
    AdminAuthService,
    AuthService
} from "@/services/implements";
import { ADMIN } from "@/types";
import { ContainerModule } from "inversify";

export const AuthModule = new ContainerModule((bind) => {
    bind<AuthController>("AuthController").to(AuthController)
    bind<AuthService>("AuthService").to(AuthService)
    bind<AdminAuthController>(ADMIN.AuthAdminController).to(AdminAuthController)
    bind<AdminAuthService>(ADMIN.AuthAdminService).to(AdminAuthService)
    bind<AdminAuthRepository>(ADMIN.AuthAdminRepository).to(AdminAuthRepository)
})