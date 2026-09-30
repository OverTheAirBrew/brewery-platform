import { TestBed } from '@suites/unit';
import { beforeEach, describe, expect, it } from 'vitest';
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

  it('should return if not body data', async () => {
    const schema = z.object({
      test: z.string(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform(
      { test: 'test' },
      { type: 'query' },
    );
    expect(result).toBeDefined();
  });

  it('should remove the id field from the object', async () => {
    const schema = z.object({
      test: z.string(),
      id: z.string().optional(),
    });

    const validationPipe = new ZodBodyValidationPipe(schema);

    const result = validationPipe.transform(
      { test: 'test', id: '123' },
      { type: 'body' },
    );
    expect(result).toEqual({ test: 'test' });
  });
});
