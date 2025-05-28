import { IUser } from "@/interface/users.interface"
import { JwtPayload } from "@/utils";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload,

            vendor?: JwtPayload
        }
    }
}

export { }