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

// User Update Schema
const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').max(50, 'Name is too long')
});

// Project Create Schema
const projectCreateSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long')
});

// Project Update Schema
const projectUpdateSchema = z.object({
    id: z.string().min(1, 'Project ID is required'),
    name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long')
});

// Project Link (Collaboration) Schema
const projectLinkSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    email: z.string().email('Invalid email address')
});

module.exports = {
    loginSchema,
    registerSchema,
    userUpdateSchema,
    projectCreateSchema,
    projectUpdateSchema,
    projectLinkSchema
};