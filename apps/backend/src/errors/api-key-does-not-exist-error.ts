import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiKeyDoesNotExistError extends HttpException {
  constructor(apiKeyId: string) {
    super(`Api Key with id ${apiKeyId} does not exist`, HttpStatus.NOT_FOUND);
  }
}
