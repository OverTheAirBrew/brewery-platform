import { z } from 'zod';

export const ProducersSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});
