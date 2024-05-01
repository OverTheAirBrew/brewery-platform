import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const ALLOW_API_KEY = 'useApiKey';
export const UseApiKey = () => SetMetadata(ALLOW_API_KEY, true);

export const ApiKey = createParamDecorator(
  (_: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.headers['x-api-key']?.toString() ||
      request.query['api-key']?.toString()
    );
  },
);
