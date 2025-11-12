import { createZodDto } from 'nestjs-zod';
import { ApiKeySchema } from '../schema/api-key.schema.ts';

export class ApiKeyDto extends createZodDto(ApiKeySchema) {}
