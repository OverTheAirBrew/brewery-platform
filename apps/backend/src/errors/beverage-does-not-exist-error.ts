import { HttpException, HttpStatus } from '@nestjs/common';

export class BeverageDoesNotExistError extends HttpException {
  constructor(beverageId: string) {
    super(
      `Beverage with id ${beverageId} does not exist`,
      HttpStatus.NOT_FOUND,
    );
  }
}
