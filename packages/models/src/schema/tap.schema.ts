import { z } from 'zod';

export const TapSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  keg_id: z
    .string()
    .uuid()
    .nullish()
    .transform((x) => x ?? undefined)
    .optional(),
});
