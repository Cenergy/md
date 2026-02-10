/**
 * Global Error Handler Middleware
 */
const config = require('../config');

const errorHandler = (err, req, res, next) => {
    console.error('[Error]', err);

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types if needed (e.g., Prisma errors, Zod errors)
    // Example: Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'Unique constraint violation. A record with this value already exists.';
    }

    res.status(statusCode).json({
        ok: false,
        message: message,
        // Only show stack trace in development
        stack: config.isProduction ? undefined : err.stack
    });
};

/**
 * 404 Not Found Handler for API routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        ok: false,
        message: `API route not found: ${req.originalUrl}`
    });
};

module.exports = { errorHandler, notFoundHandler };
