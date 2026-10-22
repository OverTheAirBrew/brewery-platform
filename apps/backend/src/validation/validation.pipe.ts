import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ZodObject, ZodSchema } from 'zod';

export class ZodBodyValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    if (this.schema instanceof ZodObject) {
      if (this.schema.shape?.id) {
        return this.schema.shape.omit({ id: true }).parse(value);
      }

      // we always omit the id from the input schema to prevent users from updating it
      return this.schema.parse(value);
    }

    return this.schema.parse(value);
  }
}
