import { BadRequestException } from '@nestjs/common';

export class InvalidCodeError extends BadRequestException {
  constructor() {
    super(`Invalid code`);
  }
}
