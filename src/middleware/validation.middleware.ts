import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { errorResponse } from "@/utils/api-respnose.utils";

export const validateRequest = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dtoInstance = plainToInstance(dtoClass, req.body, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true
            });

            const errors = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                validationError: { target: false },
                skipMissingProperties:false
            });

            if (errors.length > 0) {
                const formattedErrors = errors.map(err => ({
                    field: err.property,
                    errors: Object.values(err.constraints || {})
                }));

                res.status(400).json(errorResponse("Validation failed", 400, formattedErrors));
                return;
            }
            req.body = dtoInstance;

            next();
        } catch (error: any) {
            res.status(500).json(errorResponse("Validation error occurred", 500, error));
        }
    };
};