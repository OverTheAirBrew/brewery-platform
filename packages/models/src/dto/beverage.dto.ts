import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { BeverageSchema } from '../schema/beverage.schema';

export class BeverageDto extends createZodDto(BeverageSchema) {}
