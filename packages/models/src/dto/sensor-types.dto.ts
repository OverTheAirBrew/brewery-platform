import { createZodDto } from 'nestjs-zod';
import { SensorTypeSchema } from '../schema/sensor-type.schema.ts';

export class SensorTypeDto extends createZodDto(SensorTypeSchema) {}
