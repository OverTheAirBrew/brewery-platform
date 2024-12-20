import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { z } from 'zod';

export const CreateProducersRequestSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

export class CreateProducersRequest extends createZodDto(
  CreateProducersRequestSchema,
) {}

export const GetProducersResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export class GetProducersResponse extends createZodDto(
  GetProducersResponseSchema,
) {}
