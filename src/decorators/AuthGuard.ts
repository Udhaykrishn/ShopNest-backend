import { COOKIE_NAME } from "@/constants/cookie";
import { errorResponse } from "@/utils";
import {  jwtVerify } from "@/utils/jwt.util";
import { NextFunction, Request, Response } from "express";

export enum Role { ADMIN = "admin", VENDOR = "vendor", USER = "user", }

export interface AuthRequest extends Request { user?: any; admin?: any; vendor?: any; }

export function AuthGuard(role: Role) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (req: AuthRequest, res: Response, next: NextFunction) {
            try {
                const token = req.cookies?.[COOKIE_NAME];

                if (!token) {
                    res.status(401).json(errorResponse("Unauthorized: No token provided", 401));
                    return; // Don't return any value, just exit
                }

                try {
                    const decoded: any = jwtVerify(token);

                    if (decoded.role !== role) {
                        res.status(403).json(errorResponse("Forbidden: You don't have permission", 403));
                        return; // Don't return any value, just exit
                    }

                    req.admin = decoded;
                    // Don't return the result of originalMethod
                    originalMethod.apply(this, arguments);
                } catch (jwtError) {
                    res.status(403).json(errorResponse("Invalid or expired token", 403));
                }
            } catch (error: any) {
                console.log("Guard error is: ", error);
                res.status(500).json(errorResponse("Server error in authentication", 500));
            }
        };

        return descriptor;
    };
}