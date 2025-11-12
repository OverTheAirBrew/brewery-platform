import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string(),
  type: z.string(),
  config: z.any(),
});
