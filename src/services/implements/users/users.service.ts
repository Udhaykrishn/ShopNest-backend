import { inject, injectable } from "inversify";
import { IUserService } from "@/services/interface";
import { PaginationResponse, USER } from "@/types";
import { IUser } from '@/interface/users.interface';
import { IUserRepository } from '@/repository/users/interface/user.interface';
import {
    errorResponse,
    passwordToBeHash,
    validateEmail,
    validatePhoneNumber
} from "@/utils";

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(USER.UserRepository) private readonly userRepository: IUserRepository,
    ) { }


    async getUserGoogleEmail(email: string): Promise<IUser | null> {
        try {
            return await this.userRepository.getUserByEmail(email)
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await this.userRepository.findOne({email})

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async updateEmailConfirm(email: string): Promise<string> {
        try {

            const isEmailExistReal = await validateEmail(email)

            if (!isEmailExistReal) {
                throw new Error("Invalid email address found. Please try existing email address")
            }

            const isEmailExistInDB = await this.userRepository.getUserByEmail(email)

            if (isEmailExistInDB) {
                throw new Error("Email already taken. Please try another email")
            }

            return email;
        } catch (error: any) {
            throw errorResponse(error.message)
        }

    }

    async CheckEmail(userId: string, email: string): Promise<string> {
        try {
            const user = await this.userRepository.getUserById(userId)

            if (!user) {
                throw new Error("User not found")
            }

            const isEmailExists = await validateEmail(email)

            if (!isEmailExists) {
                throw new Error("Please enter valid email address")
            }

            if (user.email !== email) {
                throw new Error("User email should be match the current email")
            }

            return email;

        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        try {
            if (!user.email || !user.password) throw new Error("Email and password are required");

            const existingUser = await this.userRepository.getUserByEmail(user.email);
            if (existingUser) throw new Error("User already exists");

            const isEmailValid = await validateEmail(user.email)
            if (!isEmailValid) {
                throw new Error("Invalid or non-existent email")
            }

            if (user.phone) {
                const isPhoneValid = await validatePhoneNumber(user.phone as string)
                if (!isPhoneValid) {
                    throw new Error("Invalid Indian phone number")
                }
            }


            console.log("working in here ")

            return await this.userRepository.create(user);
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }

    async updateUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const existingUser = await this.userRepository.getUserById(id);
        if (!existingUser) throw new Error("User not found");


        if (user.email) {
            const isEmailValid = await validateEmail(user.email);
            if (!isEmailValid) throw new Error("Invalid or non-existent email");
        }

        if (user.phone) {
            console.log("update phone section")
            const isPhoneValid = await validatePhoneNumber(user.phone);

            if (!isPhoneValid) throw new Error("Invalid Indian phone number");
        }

        if (user.password) {
            const hashsedPassword = await passwordToBeHash(user.password)
            user.password = hashsedPassword
        }

        return this.userRepository.update(id, user);
    }

    async getUserById(id: string): Promise<IUser | null> {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new Error("User not found");
        return user;
    }

    async getAllUsers(search?: string, page?: number, limit?: number): Promise<PaginationResponse<IUser> | null> {
        return await this.userRepository.getAllUsers(search, page, limit);
    }

    async blockUser(id: string): Promise<IUser | null> {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new Error("User not found");
        return this.userRepository.blockUser(id);
    }

    async unblockUser(id: string): Promise<IUser | null> {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new Error("User not found");
        return this.userRepository.unblockUser(id);
    }

}
