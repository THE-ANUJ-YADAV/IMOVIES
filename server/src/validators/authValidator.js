import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional()
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).max(60).optional(),
    phone: z.string().optional(),
    avatar: z.string().optional()
  })
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'New password must be at least 6 characters')
  })
};
