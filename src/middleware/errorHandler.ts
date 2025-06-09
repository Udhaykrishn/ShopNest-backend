import { Request, Response, NextFunction } from 'express'
import { HttpException } from '@/exception/HttpException'

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof HttpException) {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            errors: error.errors
        })
    }

    return res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        errors: process.env.NODE_ENV === 'development' ? [error.message] : undefined
    })
} 