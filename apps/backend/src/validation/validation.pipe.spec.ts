import { z } from 'zod';
import { ZodBodyValidationPipe } from './validation.pipe';

describe('ValidationPipe', () => {
  it('should validate an object', async () => {
    const schema = z.object({
      test: z.string(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform({ test: 'test' }, { type: 'body' });
    expect(result).toBeDefined();
  });

  it('should validate a non-object', async () => {
    const schema = z.string();

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform('test', { type: 'body' });
    expect(result).toBeDefined();
  });
});
