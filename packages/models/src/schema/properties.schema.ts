import z from 'zod';

const StringPropertySchema = z.object({
  name: z.string(),
  type: z.literal('string'),
  required: z.boolean(),
  placeholder: z.string(),
});

const NumberPropertySchema = z.object({
  name: z.string(),
  type: z.literal('number'),
  required: z.boolean(),
  defaultValue: z.number(),
});

const SelectBoxPropertySchema = z.object({
  name: z.string(),
  type: z.literal('select-box'),
  required: z.boolean(),
  values: z.array(z.string()),
  defaultValue: z.string(),
});

export const PropertiesSchema = z.object({
  properties: z.array(
    z.union([
      StringPropertySchema,
      NumberPropertySchema,
      SelectBoxPropertySchema,
    ]),
  ),
});
