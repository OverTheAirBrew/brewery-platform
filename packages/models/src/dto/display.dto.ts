import { createZodDto } from 'nestjs-zod';
import { DisplaySchema } from '../schema/display.schema.ts';

export class DisplayDto extends createZodDto(DisplaySchema) {}
