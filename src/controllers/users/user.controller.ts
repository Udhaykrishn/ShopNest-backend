import { Request, Response } from "express";
import { inject } from "inversify";
import { TYPES } from "@/types/user.types"
import { controller, httpGet, httpPost, httpDelete, httpPut, request, response } from "inversify-express-utils";


@controller("/users")
export class UserController {
    constructor() {

    } 

    @httpGet("/")
    async getUsers(@request() req: Request, @response() res: Response) {
        return res.json({ message: "Hello from user side" })
    }
}