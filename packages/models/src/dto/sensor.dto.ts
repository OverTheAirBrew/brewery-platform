import { createZodDto } from 'nestjs-zod';
import { SensorSchema } from '../schema/index.ts';

export class SensorDto extends createZodDto(SensorSchema) {}
