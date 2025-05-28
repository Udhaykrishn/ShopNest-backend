import { IsString, IsArray, IsBoolean, IsNotEmpty, IsNumber, ArrayMinSize, IsOptional, ValidateNested, IsIn } from "class-validator";
import { Expose, Type } from "class-transformer";

class VariantValueDTO {
    @IsString()
    @IsNotEmpty({ message: "Variant value is required" })
    @Expose()
    value: string;

    @IsNumber({}, { message: "Price must be a number" })
    @Expose()
    price: number;

    @IsNumber({}, { message: "Regular price must be a number" })
    @Expose()
    offeredPrice: number;

    @IsNumber({}, { message: "Stock must be a number" })
    @Expose()
    stock: number;

    constructor() {
        this.value = "";
        this.price = 0;
        this.offeredPrice = 0;
        this.stock = 0;
    }
}

class UpdateVariantValueDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "Variant value is required" })
    @Expose()
    value?: string;

    @IsOptional()
    @IsNumber({}, { message: "Price must be a number" })
    @Expose()
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: "Regular price must be a number" })
    @Expose()
    offeredPrice?: number;

    @IsOptional()
    @IsNumber({}, { message: "Stock must be a number" })
    @Expose()
    stock?: number;

}

class VariantDTO {
    @IsString()
    @IsNotEmpty({ message: "Variant type is required" })
    @Expose()
    type: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantValueDTO)
    @ArrayMinSize(1, { message: "At least one variant value is required" })
    @Expose()
    values: VariantValueDTO[];

    constructor() {
        this.type = "";
        this.values = [];
    }
}

class ImageDTO {
    @IsString()
    @IsNotEmpty({ message: "Image URL is required" })
    @Expose()
    url: string;

    constructor() {
        this.url = "";
    }
}

export class CreateProductDTO {
    @IsString()
    @Expose()
    @IsNotEmpty({ message: "Product name is required" })
    name: string;

    @IsString()
    @Expose()
    @IsNotEmpty({ message: "Brand is required" })
    brand: string;

    @IsString()
    @Expose()
    @IsNotEmpty({ message: "Description is required" })
    description: string;

    @IsString()
    @Expose()
    @IsNotEmpty({ message: "Category is required" })
    category: string;

    @IsString()
    @Expose()
    @IsOptional()
    subcategory?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageDTO)
    @ArrayMinSize(1, { message: "At least one image is required" })
    @Expose()
    images: ImageDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDTO)
    @IsOptional()
    @ArrayMinSize(1, { message: "At least one variant is required" })
    @Expose()
    variants?: VariantDTO[];

    constructor() {
        this.name = "";
        this.brand = "";
        this.description = "";
        this.category = "";
        this.subcategory = "";
        this.images = [];
        this.variants = [];
    }
}

class UpdateVariantDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "Variant type is required" })
    @Expose()
    type?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateVariantValueDTO)
    @ArrayMinSize(1, { message: "At least one variant value is required" })
    @Expose()
    values?: Partial<UpdateVariantValueDTO[]>;
}

class UpdateImageDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "Image URL is required" })
    @Expose()
    url?: string;
}
export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    @Expose()
    name?: string;

    @IsOptional()
    @IsString()
    @Expose()
    brand?: string;

    @IsOptional()
    @IsString()
    @Expose()
    description?: string;

    @IsOptional()
    @IsString()
    @Expose()
    category?: string;

    @IsOptional()
    @IsString()
    @Expose()
    subcategory?: string;

    // @IsOptional()
    // @IsArray()
    // @ValidateNested({ each: false })
    // @Type(() => UpdateImageDTO)
    // @Expose()
    // images?: Partial<UpdateImageDTO[]>;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateVariantDTO)
    @Expose()
    variants?: Partial<UpdateVariantDTO[]>;

    @IsOptional()
    @IsBoolean()
    @Expose()
    isBlocked?: boolean;

    @IsOptional()
    @IsString()
    @IsIn(["pending", "rejected", "approved"], { message: "Status must be either 'pending', 'rejected', or 'approved'" })
    @Expose()
    status?: string;

    constructor() {
        this.name = "";
        this.brand = "";
        this.description = "";
        this.category = "";
        this.subcategory = "";
        // this.images = []
        this.variants = []
    }
}