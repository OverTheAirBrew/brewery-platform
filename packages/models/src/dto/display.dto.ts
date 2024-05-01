import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { DisplaySchema } from '../schema/display.schema';

export class DisplayDto extends createZodDto(DisplaySchema) {}
