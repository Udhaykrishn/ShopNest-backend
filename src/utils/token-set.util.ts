import { COOKIE_NAME, Role } from "@/constants";
import { Response, Request } from "express";
import { getRoleToken } from "./role-check.util";
import { config } from "@/config";

interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    domain?: string;
}


export async function setAuthHeader(token: string, req: Request, res: Response, role: Role, isDevelopment: boolean = process.env.NODE_ENV === "development"): Promise<void> {
    return new Promise(async (resolve) => {
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: "shopnest.zapto.org"
        }

        const { cookie_name } = await getRoleToken(role, req)

        if (!isDevelopment && process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }

        res.cookie(cookie_name, token, cookieOptions)

        res.setHeader("Authorization", `Bearer ${token}`)
        resolve()
    });
}

export async function clearAuthCookie(
    res: Response,
    cookie_name: string,
    isDevelopment: boolean = process.env.NODE_ENV === 'development'
): Promise<void> {
    return new Promise((resolve) => {
        const cookieOptions: Partial<CookieOptions> = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: "shopnest.zapto.org"
        };

        res.clearCookie(cookie_name, cookieOptions);
        res.removeHeader("Authorization");
        resolve();
    });
}
