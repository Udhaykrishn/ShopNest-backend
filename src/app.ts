import "reflect-metadata"
import { InversifyExpressServer } from "inversify-express-utils"
import express from "express"
import container from "@/config/inversify.config"
import { config } from "dotenv"
config()
import cors from "cors"

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
    app.use(cors());
    app.use(express.json())
})

const app = server.build();

export default app;