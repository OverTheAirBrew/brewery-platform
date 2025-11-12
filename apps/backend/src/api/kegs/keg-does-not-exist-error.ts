import { HttpException, HttpStatus } from '@nestjs/common';

export class KegDoesNotExistError extends HttpException {
  constructor(kegId: string) {
    super(`Keg with id ${kegId} does not exist`, HttpStatus.NOT_FOUND);
  }
}
