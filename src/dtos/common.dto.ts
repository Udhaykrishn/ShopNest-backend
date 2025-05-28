import { Exclude, Expose, Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

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

export class ForgotPasswordDto {
    @Expose()
    @IsEmail({}, { message: "Invalid email format" })
    email: string;

    constructor() {
        this.email = ""
    }
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