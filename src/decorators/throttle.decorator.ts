import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

export function Throttle(limit: number, windowMs: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        const limiter = rateLimit({
            windowMs,
            max: limit,
            message: "Too many requests, please try again later.",
            standardHeaders: true,
            legacyHeaders: false,
        });

        descriptor.value = function (req: Request, res: Response, next: NextFunction) {
            limiter(req, res, (err?: any) => {
                if (err) return res.status(429).json({ message: "Rate limit exceeded" });
                originalMethod.apply(this, [req, res, next])
            });
        };
 
        return descriptor;
    };
}
