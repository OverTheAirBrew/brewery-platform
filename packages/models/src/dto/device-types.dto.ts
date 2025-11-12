import { createZodDto } from 'nestjs-zod';
import { DeviceTypesSchema } from '../schema/device-types.schema.ts';

export class DeviceTypesDto extends createZodDto(DeviceTypesSchema) {}
