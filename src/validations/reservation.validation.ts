import { z } from 'zod';

export const reserveDropParamSchema = z.object({
  dropId: z
    .string({ error: 'Drop id is required.' })
    .uuid('Invalid drop id.'),
});

export type ReserveDropParam = z.infer<typeof reserveDropParamSchema>;
