import axios from "axios"
import { config } from "@/config";
import { validate } from "deep-email-validator"

export async function validateEmail(email: string): Promise<boolean> {
    try {
        const { valid } = await validate({
            email: email,
            validateRegex: true,
            validateMx: true,
            validateTypo: true,
            validateSMTP: false
        })
        return valid
    } catch (error: any) {
        return false;
    }
}

export async function validatePhoneNumber(phone: string): Promise<boolean> {
    try {
        const response = await axios.get(`${config.ABSTRACT_PHONE_API_KEY}${phone}`);
        return response.data?.valid && response.data?.country.code === "IN" && response.data.type === "mobile"
    } catch (error: any) {
        return false;
    }
}
