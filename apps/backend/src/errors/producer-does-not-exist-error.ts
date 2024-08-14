import { HttpException, HttpStatus } from '@nestjs/common';

export class ProducerDoesNotExistError extends HttpException {
  constructor(producerId: string) {
    super(
      `Producer with id ${producerId} does not exist`,
      HttpStatus.NOT_FOUND,
    );
  }
}
