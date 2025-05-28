import {  IsDate, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CouponDTO{
    
    @IsString()
    @IsNotEmpty()
    name:string;


    @IsNumber()
    @IsNotEmpty()
    @Min(101, { message: 'Offer price must be greater than 100' })
    offerPrice:number;

    @IsDate()
    @IsNotEmpty()
    expireOne?:Date

    @IsNumber()
    @IsNotEmpty()
    @Min(1001, { message: 'Mininum price must be greater than 1000' })
    min_price: number;


    constructor(){
        this.name = ""
        this.offerPrice = 0;
        this.min_price = 0;
    }
}