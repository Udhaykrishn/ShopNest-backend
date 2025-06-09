import { IUser } from "@/interface/users.interface";
import { PaginationResponse } from "@/types";

export interface IUserService {
    createUser(user: Partial<IUser>): Promise<IUser>;
    updateUser(id: string, user: Partial<IUser>): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(search?: string, page?: number, limit?: number): Promise<PaginationResponse<IUser> | null>;
    blockUser(id: string): Promise<IUser | null>;
    unblockUser(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>
    getUserGoogleEmail(email: string): Promise<IUser | null>
    CheckEmail(userId: string, email: string): Promise<string>
    updateEmailConfirm(email: string): Promise<string>
}