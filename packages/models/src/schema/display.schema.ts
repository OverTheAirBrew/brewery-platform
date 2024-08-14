import { z } from 'zod';

export const DisplaySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  deviceCode: z.string(),
  tap_id: z
    .string()
    .nullish()
    .transform((x) => x ?? undefined)
    .optional(),
});
