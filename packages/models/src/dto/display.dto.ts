import { createZodDto } from 'nestjs-zod';
import { DisplaySchema } from '../schema/display.schema';

export class DisplayDto extends createZodDto(DisplaySchema) {}
