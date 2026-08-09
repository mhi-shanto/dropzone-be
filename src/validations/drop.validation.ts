import { z } from 'zod';
import { DROP_ERRORS } from '../constants/drop.constants';

export const createDropSchema = z.object({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(120, 'Name must be at most 120 characters.'),
  description: z
    .string()
    .trim()
    .min(1, 'Description cannot be empty.')
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url('Invalid image URL.')
    .optional(),
  price: z
    .number({ error: 'Price is required.' })
    .finite('Price must be a valid number.')
    .gt(0, DROP_ERRORS.INVALID_PRICE),
  totalStock: z
    .number({ error: 'Total stock is required.' })
    .int('Total stock must be a whole number.')
    .min(1, DROP_ERRORS.INVALID_STOCK),
  startsAt: z.coerce.date().optional(),
});

export const dropIdParamSchema = z.object({
  id: z
    .string({ error: 'Drop id is required.' })
    .uuid('Invalid drop id.'),
});

export type CreateDropInput = z.infer<typeof createDropSchema>;
export type DropIdParam = z.infer<typeof dropIdParamSchema>;

export const activityFeedRowSchema = z.object({
  drop_id: z.string().uuid(),
  username: z.string(),
  purchased_at: z.union([z.string(), z.date()]),
});

export const recentPurchaserSchema = z.object({
  username: z.string(),
  purchasedAt: z.union([z.string(), z.date()]),
});

export const enrichedDropSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string(),
  totalStock: z.number().int(),
  availableStock: z.number().int(),
  startsAt: z.union([z.string(), z.date()]).nullable(),
  status: z.enum(['scheduled', 'live', 'ended']),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  recentPurchasers: z.array(recentPurchaserSchema),
});

export type ActivityFeedRow = z.infer<typeof activityFeedRowSchema>;
export type RecentPurchaser = z.infer<typeof recentPurchaserSchema>;
export type EnrichedDrop = z.infer<typeof enrichedDropSchema>;
