import { ContainerModule } from "inversify";
import { USER } from "@/types";
import { UserController } from "@/controllers/users";
import { UserService } from "@/services/implements";
import { UserRepository } from "@/repository/users/implements/users.repository";


export const UserModule = new ContainerModule((bind) => {
    bind<UserController>(USER.UserController).to(UserController);
    bind<UserService>(USER.UserService).to(UserService);
    bind<UserRepository>(USER.UserRepository).to(UserRepository)
});
