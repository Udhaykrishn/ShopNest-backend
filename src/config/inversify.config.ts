import {
    AuthModule,
    CategoriesModule,
    OtpModule,
    ProductsModule,
    UserModule,
    VendorModule,
    CartModule,
    AddressModule,
    OrderModule,
    CheckoutModule,
    WalletModule
} from "@/modules";
import { WishlistModule } from "@/modules/wishlist";
import { Container } from "inversify";
export const container = new Container({
    defaultScope: "Singleton",
    autoBindInjectable: true,
});


container.load(
    CategoriesModule,
    VendorModule,
    ProductsModule,
    UserModule,
    CartModule,
    OtpModule,
    AuthModule,
    WishlistModule,
    OrderModule,
    AddressModule,
    CheckoutModule,
    WalletModule
);