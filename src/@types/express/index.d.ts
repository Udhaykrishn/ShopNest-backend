import { IUser } from "@/interface/users.interface"

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export { }