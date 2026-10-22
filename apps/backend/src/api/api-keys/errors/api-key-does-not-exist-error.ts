import { NotFoundException } from '@nestjs/common';

export class ApiKeyDoesNotExistError extends NotFoundException {
  constructor(apiKeyId: string) {
    super(`Api Key with id ${apiKeyId} does not exist`);
  }
}
