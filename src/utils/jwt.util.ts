import jwt from "jsonwebtoken"
import { config } from "@/config"

export interface JwtPayload {
    id: string;
    role: "admin" | "user" | "vendor",
}

export const jwtSign = (payload: JwtPayload) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: `5h` })
}

export const jwtVerify = async (token: any) => {
    return jwt.verify(token, config.JWT_SECRET)
}