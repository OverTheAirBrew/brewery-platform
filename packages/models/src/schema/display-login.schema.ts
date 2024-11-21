import { z } from 'zod';

export const DisplayLoginSchema = z.object({
  serial: z.string(),
});
