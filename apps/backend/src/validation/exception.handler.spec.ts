import { describe, expect, it, vi } from 'vitest';
import { ZodFilter } from './exception.handler';
import { ZodError } from 'zod';

describe('ExceptionHandler', () => {
  it('should handle exceptions correctly', () => {
    const filter = new ZodFilter();

    const statusMock = vi.fn().mockReturnThis();
    const jsonMock = vi.fn().mockReturnValue({
      message: 'Internal Server Error',
    });

    const host = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue({
          statusCode: 500,
          body: 'Internal Server Error',
          status: statusMock,
          json: jsonMock,
        }),
      }),
    };

    filter.catch(
      new ZodError([{ message: 'Test error', path: [], code: 'custom' }]),
      host as any,
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [
          {
            code: 'custom',
            message: 'Test error',
            path: [],
          },
        ],
        statusCode: 400,
      }),
    );
  });
});
