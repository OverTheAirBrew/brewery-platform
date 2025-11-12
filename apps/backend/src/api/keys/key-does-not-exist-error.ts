import { HttpException, HttpStatus } from '@nestjs/common';

export class KeyDoesNotExistError extends HttpException {
  constructor(keyId: string) {
    super(`Key with id ${keyId} does not exist`, HttpStatus.NOT_FOUND);
  }
}
