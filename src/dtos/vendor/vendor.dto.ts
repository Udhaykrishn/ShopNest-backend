import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateVendorDTO {
    @Expose()
    @IsEmail({}, { message: "Please provide a valid email" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @Expose()
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/\d/, { message: "Password must contain at least one number" })
    @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    password: string;

    @Expose()
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: "Username is required" })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username: string;

    @Expose()
    @IsPhoneNumber("IN", { message: 'Please provide a valid phone number' })
    @IsNotEmpty({ message: "Phone number is required" })
    phone: string;

    @Expose()
    @IsOptional()
    @IsString()
    avatar?: string;

    constructor() {
        this.avatar = ""
        this.email = ""
        this.password = ""
        this.phone = ""
        this.username = ""
    }
}

export class UpdateVendorDTO {
    @Expose()
    @IsOptional()
    @IsEmail({}, { message: "Please provide a valid email" })
    email?: string;

    @Expose()
    @IsOptional()
    @IsString({ message: "Password must be a string" })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/\d/, { message: "Password must contain at least one number" })
    @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    password?: string;

    @Expose()
    @IsString({ message: 'Username must be a string' })
    @IsOptional()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username?: string;

    @Expose()
    @IsOptional()
    @IsPhoneNumber("IN", { message: 'Please provide a valid phone number' })
    phone?: string;

    @Expose()
    @IsOptional()
    @IsString()
    avatar?: string;
}

export class LoginVendorDTO {
    @Expose()
    @IsEmail({}, { message: "Please provide a valid email" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @Expose()
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/\d/, { message: "Password must contain at least one number" })
    @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    password: string;

    constructor() {
        this.email = "";
        this.password = "";
    }
}
