import { createZodDto } from 'nestjs-zod';
import { BeverageSchema } from '../schema/beverage.schema';

export class BeverageDto extends createZodDto(BeverageSchema) {}
