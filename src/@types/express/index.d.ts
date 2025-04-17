import { IUser } from "@/interface/users.interface"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string,
                iat: number,
                exp: number,
            }
        }
    }
}

export { }