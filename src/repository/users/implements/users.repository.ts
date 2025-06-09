import { IUser } from "@/interface/users.interface";
import { injectable } from "inversify";
import { IUserRepository } from "../interface/user.interface";
import { User, UserDocument } from "@/models/users/implements"
import { PaginationResponse } from "@/types";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
    
    constructor(){
        super(User)
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await User.findById(id).select('-password');
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email })
    }

    async getAllUsers(search?: string, page = 1, limit = 10): Promise<PaginationResponse<IUser> | null> {
        const cleanSearch = search ? search.trim().replace(/^"|"$/g, '') : '';

        const filter = cleanSearch
            ? { email: { $regex: `^${cleanSearch}`, $options: 'i' } }
            : {};

        console.log(filter)
        const skip = (page - 1) * limit;


        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);

        return { data: users, total }
    }

    async blockUser(id: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    }

    async unblockUser(id: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    }
}
