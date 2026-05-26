"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    // Determine error type based on characteristics
    let errorType = 'ServerError';
    let statusCode = err.statusCode || res.statusCode || 500;
    if (statusCode === 200)
        statusCode = 500; // default to 500 if unhandled
    if (err.name === 'ZodError') {
        errorType = 'ValidationError';
        statusCode = 400;
    }
    else if (err.name === 'ValidationError') {
        errorType = 'ValidationError'; // Mongoose
        statusCode = 400;
    }
    else if (err.message && err.message.includes('Not authorized')) {
        errorType = 'AuthError';
        statusCode = 401;
    }
    else if (statusCode === 403) {
        errorType = 'AuthError';
    }
    else if (err.type === 'RateLimitError') {
        errorType = 'RateLimitError';
        statusCode = 429;
    }
    const message = err.message || 'Internal Server Error';
    // Log the error
    if (statusCode >= 500) {
        logger_1.logger.error(`${errorType}: ${message}`, {
            stack: err.stack,
            path: req.path,
            requestId: req.requestId,
            userId: req.user?._id,
        });
    }
    else {
        logger_1.logger.warn(`${errorType}: ${message}`, {
            path: req.path,
            requestId: req.requestId,
            userId: req.user?._id,
        });
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        type: errorType,
        requestId: req.requestId,
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
