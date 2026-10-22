import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ZodObject, ZodSchema } from 'zod';

export class ZodBodyValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    if (this.schema instanceof ZodObject) {
      if (Object.prototype.hasOwnProperty.call(this.schema.shape, 'id')) {
        return this.schema.omit({ id: true }).parse(value);
      }
    }

    return this.schema.parse(value);
  }
}
