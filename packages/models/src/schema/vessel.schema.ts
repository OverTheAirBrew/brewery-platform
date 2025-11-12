import z from 'zod';

export const VesselSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  type: z.enum(['kettle', 'fermenter']),
  sensor_id: z.uuid().optional(),
  heater_id: z.uuid().optional(),
  cooler_id: z.uuid().optional(),
  logicType_id: z.string().optional(),
  logicConfig: z.any().optional(),
  targetTemp: z.number().positive().optional(),
});
