import dotenv from "dotenv"
import { IEnvConfig } from "@/interface/env.interface";

dotenv.config();

const getEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set.`);
    }
    return value;
};

export const config: IEnvConfig = {
    DATABASE_URL: getEnvVariable('DATABASE_URL'),
    PORT: getEnvVariable('PORT')
};