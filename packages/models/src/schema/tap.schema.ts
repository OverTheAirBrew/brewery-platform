import { z } from 'zod';

export const TapSchema = z.object({
  id: z.uuid().optional(),
  name: z.string(),
  keg_id: z
    .uuid()
    .nullish()
    .transform((x) => x ?? undefined)
    .optional(),
});
