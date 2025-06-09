import { SalesController } from "@/controllers/sales";
import { SalesRepository } from "@/repository/sales/implement";
import { SaleService } from "@/services/implements/sales";
import { SALES } from "@/types/sales";
import { ContainerModule } from "inversify";


export const SalesModules = new ContainerModule((bind) => {
    bind<SalesController>(SALES.SalesController).to(SalesController)
    bind<SaleService>(SALES.SalesService).to(SaleService)
    bind<SalesRepository>(SALES.SalesRepository).to(SalesRepository)
})