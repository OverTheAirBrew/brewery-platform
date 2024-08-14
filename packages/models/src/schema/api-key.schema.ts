import { z } from 'zod';

export const ApiKeySchema = z.object({
  name: z.string(),
  key: z.string(),
});
