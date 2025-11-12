import { z } from 'zod';

export const SensorSchema = z.object({
  id: z.uuid().optional(),
  name: z.string(),
  type: z.string(),
  device_id: z.uuid(),
  config: z.looseObject({}),
});
