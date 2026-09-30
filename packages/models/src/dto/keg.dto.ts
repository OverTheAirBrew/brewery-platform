import { createZodDto } from 'nestjs-zod';
import { KegSchema } from '../schema/keg.schema.ts';

export class KegDto extends createZodDto(KegSchema) {}
