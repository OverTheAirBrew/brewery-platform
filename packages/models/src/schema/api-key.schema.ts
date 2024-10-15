import { z } from 'zod';

export const ApiKeySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  key: z.string(),
});
