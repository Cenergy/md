const { z } = require('zod');

// Login Schema
const loginSchema = z.object({
    email: z.string().email('Email format is invalid'),
    password: z.string().min(1, 'Password is required')
});

// Register Schema
const registerSchema = z.object({
    email: z.string().email('Email format is invalid'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    code: z.string().length(6, 'Verification code must be 6 digits').optional()
});

module.exports = {
    loginSchema,
    registerSchema
};