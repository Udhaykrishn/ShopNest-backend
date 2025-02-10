import { Container } from "inversify";
import { VENDOR, USER, CATEGORY } from "@/types"
import { UserController } from "@/controllers/users/user.controller";
import { VendorController } from "@/controllers/vendor/vendor.controller";
import { VendorRepository } from "@/repository/vendor/vendor.repository";
import { VendorService } from "@/services/vendor/vendor.service";
import { PRODUCT } from "@/types/product.types";
import { ProductController } from "@/controllers/vendor/products.controller";
import { ProductService } from "@/services/vendor/product.services";
import { ProductRepository } from "@/repository/vendor/product.repository";
import { CategoryRespository } from "@/repository/admin/category.repository";
import { CategoryService } from "@/services/admin/category.service";
import { CategoryController } from "@/controllers/admin/category.controller";

const container = new Container();

container.bind<UserController>(USER.UserController).to(UserController)
container.bind<VendorController>(VENDOR.VendorController).to(VendorController)
container.bind<VendorRepository>(VENDOR.VendorRepository).to(VendorRepository)
container.bind<VendorService>(VENDOR.VendorService).to(VendorService)
container.bind<ProductController>(PRODUCT.ProductController).to(ProductController)
container.bind<ProductService>(PRODUCT.ProductService).to(ProductService)
container.bind<ProductRepository>(PRODUCT.ProductRepository).to(ProductRepository)
container.bind<CategoryRespository>(CATEGORY.categoryRepository).to(CategoryRespository)
container.bind<CategoryService>(CATEGORY.categoryServices).to(CategoryService)
container.bind<CategoryController>(CATEGORY.categoryController).to(CategoryController)

export default container   