import { z } from 'zod';

export const purchaseParamsSchema = z.object({
  reservationId: z
    .string({ error: 'Reservation ID is required.' })
    .uuid('Reservation ID must be a valid UUID.'),
});

export const purchaseDropRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  available_stock: z.coerce.number().int().min(0),
  price: z.string(),
});

export type PurchaseParams = z.infer<typeof purchaseParamsSchema>;
export type PurchaseDropRow = z.infer<typeof purchaseDropRowSchema>;
