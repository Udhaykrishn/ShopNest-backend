import { ContainerModule } from "inversify";
import { ProductsController } from "@/controllers/products/product.controller";
import { ProductsService } from "@/services/implements";
import { ProductsRepository } from "@/repository/products/implements/product.repository";
import { PRODUCT, VARIANT } from "@/types";
import { VariantRepository } from "@/repository/vendor/implements";


export const ProductsModule = new ContainerModule((bind) => {
    bind<ProductsController>(PRODUCT.ProductController).to(ProductsController);
    bind<ProductsService>(PRODUCT.ProductService).to(ProductsService);
    bind<ProductsRepository>(PRODUCT.ProductRepository).to(ProductsRepository)
    bind<VariantRepository>(VARIANT.VariantRepository).to(VariantRepository)
});
