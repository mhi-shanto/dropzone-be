import { z } from 'zod';

export const expiredReservationRowSchema = z.object({
  drop_id: z.string().uuid(),
});

export const updatedDropRowSchema = z.object({
  id: z.string().uuid(),
  available_stock: z.coerce.number().int().min(0),
});

export type ExpiredReservationRow = z.infer<typeof expiredReservationRowSchema>;
export type UpdatedDropRow = z.infer<typeof updatedDropRowSchema>;
