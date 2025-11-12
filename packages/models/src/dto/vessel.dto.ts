import { createZodDto } from 'nestjs-zod';
import { VesselSchema } from '../index.ts';

export class VesselDto extends createZodDto(VesselSchema) {}
