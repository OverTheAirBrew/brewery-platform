import z from 'zod';

export const ActorSchema = z.object({
  id: z.uuid().optional(),
  name: z.string(),
  device_id: z.uuid(),
  type: z.string(),
  config: z.any(),
});
