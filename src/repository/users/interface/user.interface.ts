import { IUser } from "@/interface/users.interface";
import { IBaseRepository } from "@/repository/base.repository.interface";
import { PaginationResponse } from '@/types';

export interface IUserRepository extends IBaseRepository<IUser> {
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getAllUsers(search?: string, page?: number, limit?: number): Promise<PaginationResponse<IUser> | null>;
    blockUser(id: string): Promise<IUser | null>;
    unblockUser(id: string): Promise<IUser | null>;
}