import { HttpException, HttpStatus } from '@nestjs/common';

export class TapDoesNotExistError extends HttpException {
  constructor(tapId: string) {
    super(`Tap with id ${tapId} does not exist`, HttpStatus.NOT_FOUND);
  }
}
