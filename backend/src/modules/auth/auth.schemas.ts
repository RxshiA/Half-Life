import { z } from 'zod';

const emailField = z
  .string()
  .email('Invalid email address')
  .transform((s) => s.trim().toLowerCase());

export const registerSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().min(7, 'Invalid phone number').max(20),
  addressLine1: z.string().min(3, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().optional().default('AU'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
