import "reflect-metadata"
import { InversifyExpressServer } from "inversify-express-utils"
import express from "express"
import container from "@/config/inversify.config"
import { config } from "@/config"
import { config as DotConfig } from "dotenv"
DotConfig()
import cookie from "cookie-parser"
import cors from "cors"
import helmet from "helmet"

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
    app.use(cors({ credentials: true, origin: config.FRONT_URL }));
    app.use(helmet())
    app.use(cookie())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
})

const app = server.build();

export default app;