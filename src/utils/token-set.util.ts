import { COOKIE_NAME, Role } from "@/constants";
import { Response, Request } from "express";
import { getRoleToken } from "./role-check.util";

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
            secure: !isDevelopment,
            sameSite: 'strict',
        }


        const { cookie_name } = await getRoleToken(role, req)

        if (!isDevelopment && process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }

        res.cookie(cookie_name, token, cookieOptions)
        console.log("set-cookie header: ", res.getHeader("Set-Cookie"))

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
            secure: !isDevelopment,
            sameSite: 'strict',
        };

        if (!isDevelopment && process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        res.clearCookie(cookie_name, cookieOptions);
        res.removeHeader("Authorization");
        resolve();
    });
}
