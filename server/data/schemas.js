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

// Project Profile Schema
// passthrough() allows additional fields (profileData) to pass through validation
const projectProfileSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    query: z.any().optional()
}).passthrough();

// Project Link (Collaboration) Schema
const projectLinkSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    email: z.string().email('Invalid email address')
});

// Menu Schema
const menuSaveSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    name: z.string().min(1, 'Menu name is required'),
    link: z.string().min(1, 'Menu link is required')
});

const menuSortSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    data: z.array(z.object({
        link: z.string().min(1)
    }))
});

// Slider Schema
// Recursive schema for nested sliders is tricky in Zod without type inference,
// but for runtime validation we can use z.lazy or just validate the top level array structure
const sliderItemSchema = z.object({
    name: z.string().optional(),
    link: z.string().optional(),
    group: z.boolean().optional(),
    children: z.array(z.any()).optional() // loose validation for children to avoid recursion complexity
});

const sliderSaveSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    link: z.string().min(1, 'Menu link is required'),
    data: z.array(sliderItemSchema)
});

module.exports = {
    loginSchema,
    registerSchema,
    userUpdateSchema,
    projectCreateSchema,
    projectUpdateSchema,
    projectProfileSchema,
    projectLinkSchema,
    menuSaveSchema,
    menuSortSchema,
    sliderSaveSchema
};
