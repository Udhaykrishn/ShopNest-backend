import { AdminModule, AuthModule, CategoryModule, OtpModule, ProductModule, ProductsModule, UserModule, VendorModule } from "@/modules";
import { CategoriesModule } from "@/modules/categories.module";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";


const container = new Container({
    defaultScope: "Singleton",
    autoBindInjectable: true,
});


container.load(AdminModule, CategoriesModule,VendorModule, ProductsModule, ProductModule, CategoryModule, UserModule, OtpModule, AuthModule);


container.load(buildProviderModule());

export default container;
