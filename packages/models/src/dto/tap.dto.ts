import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { TapSchema } from '../schema';

export class TapDto extends createZodDto(TapSchema) {}
