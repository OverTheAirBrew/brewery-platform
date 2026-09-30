import { createZodDto } from 'nestjs-zod';
import { BeverageSchema } from '../schema/beverage.schema.ts';

export class BeverageDto extends createZodDto(BeverageSchema) {}
