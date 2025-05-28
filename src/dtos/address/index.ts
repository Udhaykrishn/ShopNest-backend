import { Expose } from 'class-transformer';
import {
    IsString,
    IsBoolean,
    IsNotEmpty,
    Matches,
    IsOptional,
} from 'class-validator';

export class AddressCreateDTO {
    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Type is required' })
    type?: string;

    @IsString()
    @Expose()
    @IsNotEmpty({ message: 'Street is required' })
    street?: string;

    @IsString()
    @Expose()
    landmark?: string;

    @IsString()
    @Expose()
    @IsNotEmpty({ message: 'City is required' })
    city?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'State is required' })
    state?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Pincode is required' })
    pincode?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Country is required' })
    country?: string;

    @Expose()
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Phone is required' })
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number format' })
    phone?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'District is required' })
    district?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name?: string;
}

export class AddressUpdateDTO {
    @Expose()
    @IsString()
    @IsOptional()
    type?: string;

    @Expose()
    @IsString()
    @IsOptional()
    street?: string;

    @Expose()
    @IsString()
    @IsOptional()
    landmark?: string;

    @Expose()
    @IsString()
    @IsOptional()
    city?: string;

    @Expose()
    @IsString()
    @IsOptional()
    state?: string;

    @Expose()
    @IsString()
    @IsOptional()
    pincode?: string;

    @Expose()
    @IsString()
    @IsOptional()
    country?: string;

    @Expose()
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @Expose()
    @IsString()
    @IsOptional()
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number format' })
    phone?: string;

    @Expose()
    @IsString()
    @IsOptional()
    district?: string;

    @Expose()
    @IsString()
    @IsOptional()
    name?: string;
}