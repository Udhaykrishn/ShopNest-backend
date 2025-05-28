import { IsString, IsOptional, IsBoolean, MinLength, IsArray, ArrayNotEmpty } from "class-validator";
import { Expose, Type } from "class-transformer";
export class CreateCategoryDTO {
    @Expose()
    @IsString()
    @MinLength(3, { message: "Category name must be at least 3 characters long." })
    name: string;

    @IsArray()
    @Expose()
    @IsOptional()
    @Type(() => String)
    @IsString({ each: true })
    subCategory?: string[]

    constructor() {
        this.name = ""
        this.subCategory = []
    }
}

export class UpdateCategoryDTO {
    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(3, { message: "Category name must be at least 3 characters long" })
    name?: string;


    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @Type(() => String)
    @Expose()
    subCategory?: string[];

    constructor() {
        this.name = ""
        this.subCategory = []
    }

}

export class BlockCategoryDTO {
    @Expose()
    @IsBoolean({ message: "isBlocked must be a boolean value" })
    isBlocked: boolean;

    constructor() {
        this.isBlocked = false
    }
}


