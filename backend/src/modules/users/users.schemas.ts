import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  addressLine1: z.string().min(3).max(200).optional(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  postalCode: z.string().min(3).max(20).optional(),
  country: z.string().max(50).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
