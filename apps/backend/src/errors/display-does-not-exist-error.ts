import { HttpException, HttpStatus } from '@nestjs/common';

export class DisplayDoesNotExistError extends HttpException {
  constructor(displayId: string) {
    super(`Display with id ${displayId} does not exist`, HttpStatus.NOT_FOUND);
  }
}
