import crypto from "crypto"
import argon2 from "argon2"

export const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
}

export const hashOTP = async (otp: string): Promise<string> => {
    return await argon2.hash(otp)
}

export const verifyHashedOTP = async (hashedOTP: string, otp: string): Promise<boolean> => {
    return await argon2.verify(hashedOTP, otp)
}