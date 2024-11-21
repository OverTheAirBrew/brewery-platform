import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { z } from 'zod';

export const CreateKegRequestSchema = z.object({
  id: z.string().optional(),
  beverage_id: z.string(),
  type: z.string(),
  status: z.enum(['IN_STOCK', 'IN_USE', 'EMPTY']),
});

export class CreateKegRequest extends createZodDto(CreateKegRequestSchema) {}

export const GetKegResponseSchema = z.object({
  id: z.string().optional(),
  beverage_id: z.string(),
  type: z.string(),
  status: z.enum(['IN_STOCK', 'IN_USE', 'EMPTY']),
  beverage: z.object({
    name: z.string(),
    producer: z.object({
      name: z.string(),
    }),
  }),
});

export class GetKegResponse extends createZodDto(GetKegResponseSchema) {}
