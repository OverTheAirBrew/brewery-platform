import { z } from 'zod';

export const KegSchema = z.object({
  id: z.string().optional(),
  beverage_id: z.string(),
  type: z.string(),
  status: z.enum(['IN_STOCK', 'IN_USE', 'EMPTY']),
});
