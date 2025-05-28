import { IsEmail, IsString, IsOptional, MinLength, Matches, IsPhoneNumber, IsDate, IsNotEmpty, Length, MaxLength, Max } from "class-validator";
import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class CreateUserDTO {
    @Expose()
    @IsEmail({}, { message: "pleasee provide a valid email" })
    email?: string;

    @Expose()
    @IsString({ message: "Password must be a string" })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/\d/, { message: "Password must contain at leatst cone number" })
    @Matches(/[a-z]/, { message: "Password must conatain at least one lowercase letter" })
    @Matches(/[A-Z]/, { message: "Password must conatain at least one uppercase letter" })
    password?: string;

    @Expose()
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username?: string;

    @Expose()
    @IsPhoneNumber("IN", { message: 'Please provide a valid phone number' })
    phone?: string;

    @Expose()
    @IsOptional()
    @IsString()
    avatar?: string;
}

@Exclude()
export class OtpDto {
    @Expose()
    @IsString()
    otp?: string;

    @Expose()
    @IsDate()
    @Type(() => Date)
    otpExpires?: Date;
}

@Exclude()
export class UpdateUserDTO {
    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(4, { message: "Minimum 4 characters needed" })
    username?: string;
    
    @Expose()
    @IsOptional()
    @IsString()
    avatar?: string;
    
    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(10, { message: "Should be enter 10 digtis" })
    @MaxLength(10, { message: "Should be enter 10 digtis" })
    phone?: string;


}

export class ForgotPasswordDto {
    @Expose()
    @IsNotEmpty()
    @IsEmail({}, { message: "Invalid email format" })
    email: string;

    constructor() {
        this.email = ""
    }
}

export class VerifyOtpDto {
    @Expose()
    @IsEmail({}, { message: "Invalid email format" })
    email: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: "OTP is required" })
    @Length(6, 6, { message: "OTP must be exactly 6 digits" })
    otp: string;

    constructor() {
        this.email = ""
        this.otp = ""
    }
}

export class SendOtpDto {
    @Expose()
    @IsEmail({}, { message: "Invalid email format" })
    email: string;

    constructor() {
        this.email = ""
    }
}


export class RefreshTokenDto {
    @Expose()
    @IsString()
    refreshToken: string;

    constructor() {
        this.refreshToken = ""
    }
}
