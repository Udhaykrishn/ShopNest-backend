import { Role} from "@/constants";
import { Request } from "express";

export async function getRoleToken(
    role: string,
    req: Request
): Promise<{ token: string | null; cookie_name: string }> {

    const roleToken: { token: string | null; cookie_name: string } = {
        token: null,
        cookie_name: ""
    };

    switch (role) {
        case Role.ADMIN:
            roleToken.token = req?.cookies?.["admin_auth_token"] || null;
            roleToken.cookie_name = "admin_auth_token";
            break;
        case Role.VENDOR:
            roleToken.token = req?.cookies?.["vendor_auth_token"] || null;
            roleToken.cookie_name = "vendor_auth_token";
            break;
        case Role.USER:
            roleToken.token = req?.cookies?.["user_auth_token"] || null;
            roleToken.cookie_name = "user_auth_token";
            break;
        default:
            roleToken.token = null;
    }

    return roleToken;
}

