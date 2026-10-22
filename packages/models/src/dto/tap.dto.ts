import { createZodDto } from 'nestjs-zod';
import { TapSchema } from '../schema';

export class TapDto extends createZodDto(TapSchema) {}
