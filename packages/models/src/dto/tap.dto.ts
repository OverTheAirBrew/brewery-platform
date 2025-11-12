import { createZodDto } from 'nestjs-zod';
import { TapSchema } from '../schema/index.ts';

export class TapDto extends createZodDto(TapSchema) {}
