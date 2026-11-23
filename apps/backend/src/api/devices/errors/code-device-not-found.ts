import { BadRequestException } from '@nestjs/common';

export class CodeDeviceNotFoundError extends BadRequestException {
  constructor() {
    super(`Code device not found`);
  }
}
