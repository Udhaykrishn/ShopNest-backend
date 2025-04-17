import { Role } from "@/constants";
import {
    errorResponse,
    getRoleToken,
    jwtVerify
} from "@/utils";
import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
    user?: any;
    admin?: any;
    vendor?: any;
}

export function AuthGuard(role: Role) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: AuthRequest, res: Response, next: NextFunction) {
            try {
                const { token } = await getRoleToken(role, req)


                if (!token) {
                    console.log("auth guard: no token working", token)
                    return res.status(401).json(errorResponse("Unauthorized: No token provided", 401));
                }

                try {
                    const decoded: any = await jwtVerify(token);

                    if (!Object.values(Role).includes(decoded.role)) {
                        return res.status(403).json(errorResponse("Forbidden: Invalid role", 403));
                    }

                    if (role === Role.ADMIN) {
                        req.admin = decoded
                    } else if (role === Role.USER) {
                        req.user = decoded
                    } else {
                        req.vendor = decoded
                    }

                    return await originalMethod.call(this, req, res, next);
                } catch (jwtError: any) {
                    console.log(req.url, req.baseUrl)
                    console.log("role is: ", role)
                    return res.status(401).json(errorResponse("Invalid or expired token", 401));
                }
            } catch (error: any) {
                console.log("Guard error:", error);
                return res.status(500).json(errorResponse("Server error in authentication", 500));
            }
        };

        return descriptor;
    };
}
