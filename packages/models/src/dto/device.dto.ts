import { createZodDto } from 'nestjs-zod';
import { DeviceSchema } from '../schema/index.ts';

export class DeviceDto extends createZodDto(DeviceSchema) {}
