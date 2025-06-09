import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import express from "express";
import { config, container } from "@/config";
import { config as DotConfig } from "dotenv";
DotConfig();
import cookie from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(helmet());
    app.use(compression());

    app.use(cors({
        credentials: true,
        origin: [config.FRONT_URL],
        methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }));

    app.use(hpp());

    app.use(express.json());
    app.use(cookie());
});

const app = server.build();
export default app;
