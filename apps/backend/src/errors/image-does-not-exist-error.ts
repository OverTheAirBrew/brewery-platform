import { HttpException, HttpStatus } from '@nestjs/common';

export class ImageDoesNotExistError extends HttpException {
  constructor(id: string) {
    super(`Image with Id ${id} does not exist`, HttpStatus.NOT_FOUND);
  }
}
