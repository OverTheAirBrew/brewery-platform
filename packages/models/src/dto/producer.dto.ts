import { createZodDto } from 'nestjs-zod';
import { ProducersSchema } from '../schema';

export class ProducersDto extends createZodDto(ProducersSchema) {}
