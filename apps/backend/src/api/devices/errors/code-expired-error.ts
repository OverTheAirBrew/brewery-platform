import { BadRequestException } from '@nestjs/common';

export class CodeExpiredError extends BadRequestException {
  constructor() {
    super(`Code has expired`);
  }
}
