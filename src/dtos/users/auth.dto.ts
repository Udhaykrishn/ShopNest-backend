import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";



export class LoginUserDto {
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail()
    @Expose()
    email: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString({ message: "Password is must be a string" })
    @Expose()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/\d/, { message: "Password must contain at leatst cone number" })
    @Matches(/[a-z]/, { message: "Password must conatain at least one lowercase letter" })
    @Matches(/[A-Z]/, { message: "Password must conatain at least one uppercase letter" })
    password: string;

    constructor() {
        this.email = ""
        this.password = ""
    }

}