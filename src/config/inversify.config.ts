import { Container } from "inversify";
import { TYPES } from "@/types"
import { UserController } from "@/controllers/users/user.controller";

const container = new Container();

container.bind<UserController>(TYPES.UserController).to(UserController)

export default container