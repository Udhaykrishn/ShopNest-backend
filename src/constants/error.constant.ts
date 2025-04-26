import { HTTP_STATUS } from './http-status.constant'

export const ERROR_MESSAGES = {
    // General Errors
    INTERNAL_SERVER_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    CONFLICT: 'Resource already exists',
    BAD_REQUEST: 'Bad request',
    INVALID_ID: 'Invalid ID format',

    // Database Errors
    DB_CONNECTION_ERROR: 'Database connection error',
    DB_QUERY_ERROR: 'Database query error',
    DB_DUPLICATE_ERROR: 'Duplicate entry found',
    DB_VALIDATION_ERROR: 'Database validation error',

    // Authentication Errors
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_REQUIRED: 'Authentication token is required',

    // Resource Specific Errors
    USER_NOT_FOUND: 'User not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    CATEGORY_NOT_FOUND: 'Category not found',
    VENDOR_NOT_FOUND: 'Vendor not found',
    ORDER_NOT_FOUND: 'Order not found',
} as const

export const ERROR_CODES = {
    // Database Error Codes
    DUPLICATE_KEY: 11000,
    VALIDATION_ERROR: 'ValidationError',
    CAST_ERROR: 'CastError',

    // Custom Error Codes
    NOT_FOUND: HTTP_STATUS.NOT_FOUND,
    UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
    FORBIDDEN: HTTP_STATUS.FORBIDDEN,
    CONFLICT: HTTP_STATUS.CONFLICT,
    BAD_REQUEST: HTTP_STATUS.BAD_REQUEST,
    INTERNAL_SERVER_ERROR: HTTP_STATUS.INTERNAL_SERVER_ERROR,
} as const 