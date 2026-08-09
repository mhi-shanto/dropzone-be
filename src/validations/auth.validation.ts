import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .email('Invalid email address.')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .email('Invalid email address.')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
