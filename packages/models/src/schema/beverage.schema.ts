import { z } from 'zod';

export const BeverageSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  style: z.string(),
  abv: z.number().positive(),
  description: z.string(),
  producer_id: z.string(),
});
