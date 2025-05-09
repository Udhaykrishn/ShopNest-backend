import { config } from "@/config"
import crypto from "crypto-js"
import { errorResponse } from "./api-respnose.utils"


export const dataToEncript = (data: any): any => {
    return crypto.AES.encrypt(JSON.stringify(data), config.CRYTPO_SECRET).toString()
}

export const encryptToData = (encryptedText: string): any => {
    try {
        const bytes = crypto.AES.decrypt(encryptedText, config.CRYTPO_SECRET)

        const result = bytes.toString(crypto.enc.Utf8)

        return JSON.parse(result);
    } catch (error: any) {
        throw errorResponse(error.message)
    }
}