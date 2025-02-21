import { errorResponse } from "@/utils";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@/constants/cookie";
import User from "@/models/users/user.model";
import { Vendor } from "@/models/vendors";

export function BlockGuard() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const token = req.cookies?.[COOKIE_NAME];

                if (!token) {
                    return res.status(401).json(errorResponse("Unauthorized: No token provided", 401));
                }

                // Convert JWT verification into a Promise-based function
                const decoded: any = await new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
                        if (err) reject(err);
                        else resolve(decoded);
                    });
                });

                // Find the user/vendor in the database
                let role: any = null;

                if (decoded.role === "user") {
                    role = await User.findById(decoded.id);
                } else if (decoded.role === "vendor") {
                    role = await Vendor.findById(decoded.id);
                }

                // If user/vendor not found or blocked
                if (!role) {
                    res.clearCookie(COOKIE_NAME); // Clear token
                    return res.status(404).json(errorResponse("User not found", 404));
                }

                if (role.isBlocked) {
                    res.clearCookie(COOKIE_NAME); // Remove token
                    return res.status(403).json({
                        success: false,
                        message: "User is blocked. Redirecting to login...",
                        redirect: "/login"  // Send redirect URL
                    });
                }

                // Proceed to the original method
                return originalMethod.call(this, req, res, next);
            } catch (error: any) {
                console.log(error.message)
                return res.status(500).json(errorResponse("Server error in authentication", 500));
            }
        };

        return descriptor;
    };
}
