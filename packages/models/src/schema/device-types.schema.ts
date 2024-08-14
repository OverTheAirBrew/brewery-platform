import { z } from 'zod';

export const StringPropertySchema = z.object({
  name: z.string(),
  type: z.literal('string'),
  required: z.boolean(),
  placeholder: z.string(),
});

export const NumberPropertySchema = z.object({
  name: z.string(),
  type: z.literal('number'),
  required: z.boolean(),
  defaultValue: z.number(),
});

export const SelectBoxPropertySchema = z.object({
  name: z.string(),
  type: z.literal('select-box'),
  required: z.boolean(),
  values: z.array(z.string()),
  defaultValue: z.string(),
});

export const DeviceTypesSchema = z.object({
  name: z.string(),
  properties: z.array(
    z.union([
      StringPropertySchema,
      NumberPropertySchema,
      SelectBoxPropertySchema,
    ]),
  ),
});
