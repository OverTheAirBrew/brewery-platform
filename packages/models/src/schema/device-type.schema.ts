import { z } from 'zod';
import { PropertiesSchema } from './properties.schema.ts';

export const DeviceTypeSchema = z
  .object({
    name: z.string(),
  })
  .extend(PropertiesSchema.shape);
