import { IUser } from "@/interface/users.interface";

export interface IUserServices {
    getUser(): Promise<IUser>
}