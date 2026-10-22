import { z } from 'zod';
import { ZodBodyValidationPipe } from './validation.pipe';

describe('ValidationPipe', () => {
  it('should validate an object', async () => {
    const schema = z.object({
      test: z.string(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform(
      { test: 'test', id: 'testing' },
      { type: 'body' },
    );
    expect(result).toBeDefined();
  });

  it('should validate a non-object', async () => {
    const schema = z.string();

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform('test', {
      type: 'body',
    });

    expect(result).toBeDefined();
  });

  it('should return the object if its not body', async () => {
    const schema = z.object({
      test: z.string(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform(
      { test: 'test', id: 'testing' },
      { type: 'query' },
    );

    expect(result).toBeDefined();
  });

  it('should omit the id field if present in the body', async () => {
    const schema = z.object({
      test: z.string(),
      id: z.string(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform(
      { test: 'test', id: 'testing' },
      { type: 'body' },
    );

    expect(result).toEqual({ test: 'test' });
  });
});
