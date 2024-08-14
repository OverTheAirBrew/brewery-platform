import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { DeviceTypesSchema } from '../schema/device-types.schema';

export class DeviceTypesDto extends createZodDto(DeviceTypesSchema) {}
