import { createZodDto } from 'nestjs-zod';
import { ProducersSchema } from '../schema/index.ts';

export class ProducersDto extends createZodDto(ProducersSchema) {}
