import { injectable } from "inversify";
import { IUserServices } from "../interface/user.interface";
import { IUser } from '../../interface/users.interface';

@injectable()
export class UserService implements IUserServices {
    async getUser(): Promise<IUser> {
        try {
            return // users
        } catch (error) {
            throw new Error("Failed")
        }
    }
}