import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { ApiKeySchema } from '../schema/api-key.schema';

export class ApiKeyDto extends createZodDto(ApiKeySchema) {}
