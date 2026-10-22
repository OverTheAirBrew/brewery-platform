import { createZodDto } from 'nestjs-zod';
import { DeviceTypesSchema } from '../schema/device-types.schema';

export class DeviceTypesDto extends createZodDto(DeviceTypesSchema) {}
