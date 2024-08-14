import { PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod/lib';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const parsedValue = this.schema.parse(value);
    return parsedValue;
  }
}
