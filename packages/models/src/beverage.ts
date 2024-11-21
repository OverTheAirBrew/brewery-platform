import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const GetBeverageRequestSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  style: z.string(),
  abv: z.number().positive(),
  description: z.string(),
  producer_id: z.string(),
  producer: z.object({
    name: z.string(),
  }),
});

export class GetBeverageRequest extends createZodDto(
  GetBeverageRequestSchema,
) {}

export const CreateBeverageRequestSchama = zfd.formData({
  id: zfd.text().optional(),
  name: zfd.text(),
  style: zfd.text(),
  abv: zfd.numeric(z.number().positive()),
  description: zfd.text(),
  producer_id: zfd.text(),
});

export class CreateBeverageRequest extends createZodDto(
  CreateBeverageRequestSchama,
) {}
