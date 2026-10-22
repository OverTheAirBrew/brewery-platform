import { createZodDto } from 'nestjs-zod';
import { ApiKeySchema } from '../schema/api-key.schema';

export class ApiKeyDto extends createZodDto(ApiKeySchema) {}
