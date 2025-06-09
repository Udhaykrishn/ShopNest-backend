import { ContainerModule } from "inversify";
import { VENDOR } from "@/types";
import { AuthVendorController } from "@/controllers/vendor/auth.controller";
import {
    AuthVendorService,
    VendorService
} from "@/services/implements";
import { VendorRepository } from "@/repository/vendor/implements";
import { VendorController } from "@/controllers/vendor";

export const VendorModule = new ContainerModule((bind) => {
    bind<VendorController>(VENDOR.VendorController).to(VendorController);
    bind<VendorService>(VENDOR.VendorService).to(VendorService);
    bind<VendorRepository>(VENDOR.VendorRepository).to(VendorRepository);
    bind<AuthVendorService>(VENDOR.AuthVendorService).to(AuthVendorService)
    bind<AuthVendorController>(VENDOR.AuthVendorController).to(AuthVendorController)
});
