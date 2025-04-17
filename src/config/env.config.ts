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
    GEMINI_API: getEnvVariable('GEMINI_API'),
    PORT: getEnvVariable('PORT'),
    ABSTRACT_EMAIL_API_KEY: getEnvVariable('ABSTRACT_EMAIL_API_KEY'),
    ABSTRACT_PHONE_API_KEY: getEnvVariable('ABSTRACT_PHONE_API_KEY'),
    RESEND_API_KEY: getEnvVariable('RESEND_API_KEY'),
    GMAIL_APP_ADDRESS: getEnvVariable("GMAIL_APP_ADDRESS"),
    GMAIL_APP_PASSWORD: getEnvVariable("GMAIL_APP_PASSWORD"),
    JWT_SECRET: getEnvVariable("JWT_SECRET"),
    FRONT_URL: getEnvVariable("FRONT_URL"),
    CLOUDINARY_CLOUD_NAME: getEnvVariable("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnvVariable("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnvVariable("CLOUDINARY_API_SECRET"),
    GOOGLE_CLIENT_ID: getEnvVariable("GOOGLE_CLIENT_ID"),
    CRYTPO_SECRET: getEnvVariable("CRYTPO_SECRET"),
    SIGN_KEY: getEnvVariable("SIGN_KEY")
};