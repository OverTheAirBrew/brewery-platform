import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { ProducersSchema } from '../schema';

export class ProducersDto extends createZodDto(ProducersSchema) {}
