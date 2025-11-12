import { createZodDto } from 'nestjs-zod';
import { DeviceTypeSchema } from '../schema/device-type.schema.ts';

export class DeviceTypeDto extends createZodDto(DeviceTypeSchema) {}
