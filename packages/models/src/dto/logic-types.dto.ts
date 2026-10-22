import { createZodDto } from 'nestjs-zod';
import { LogicTypesSchema } from '../schema/logic-types.schema.ts';

export class LogicTypesDto extends createZodDto(LogicTypesSchema) {}
