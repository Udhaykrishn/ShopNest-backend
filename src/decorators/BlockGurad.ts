import {
    errorResponse,
    getRoleToken,
    jwtVerify
} from "@/utils";
import {
    Request,
    Response,
    NextFunction
} from "express";
import { User } from "@/models/users/implements";
import { Vendor } from "@/models/vendors/implements";
import { Role } from "@/constants";


export function BlockGuard(roles: Role) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { cookie_name, token } = await getRoleToken(roles, req)


                if (!token) {
                    console.log("auth guard: no token working")
                    return res.status(401).json(errorResponse("Unauthorized: No token provided", 401));
                }

                let decoded: any;

                try {
                    decoded = await jwtVerify(token);
                } catch (err: any) {
                    if (err.name === "TokenExpiredError") {
                        res.clearCookie(cookie_name);
                        return res.status(403).json(errorResponse("Token expired. Please log in again.", 403));
                    }
                    return res.status(401).json(errorResponse("Invalid token", 401));
                }

                let role: any = null;

                if (decoded.role === "user") {
                    role = await User.findById(decoded.id);
                } else if (decoded.role === "vendor") {
                    role = await Vendor.findById(decoded.id);
                }

                let RoleModel = cookie_name

                if (!role) {
                    res.clearCookie(RoleModel);
                    return res.status(404).json(errorResponse("User not found", 404));
                }

                if (role.isBlocked) {
                    res.clearCookie(RoleModel);
                    return res.status(403).json({
                        success: false,
                        message: "Your account blocked by admin",
                    });
                }

                return await originalMethod.call(this, req, res, next);
            } catch (error: any) {
                return res.status(500).json(errorResponse("Server error in authentication", 500));
            }
        };

        return descriptor;
    };
}
