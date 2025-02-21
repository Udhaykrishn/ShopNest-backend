import { IUser } from "@/interface/users.interface";
import { injectable } from "inversify";
import { IUserRepository } from "./interface/user.interface";
import UserModel from "@/models/users/user.model"

@injectable()
export class UserRepository implements IUserRepository {
    async createUser(user: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(user)
    }

    async updateUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id).select('-password');
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email })
    }

    async getAllUsers(search?: string, page = 1, limit = 10): Promise<{ users: IUser[], total: number }> {
        const cleanSearch = search ? search.trim().replace(/^"|"$/g, '') : '';

        const filter = cleanSearch
            ? { email: { $regex: `^${cleanSearch}`, $options: 'i' } }
            : {};

        console.log(filter)
        const skip = (page - 1) * limit;


        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            UserModel.countDocuments(filter)
        ]);

        return { users, total }
    }

    async blockUser(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    }

    async unblockUser(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    }

    async setOtp(email: string, otp: string, expiry: Date): Promise<void> {
        await UserModel.updateOne({ email }, { otp, otpExpiry: expiry });
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const user = await UserModel.findOne({ email, otp });
        return !!user;
    }
}
