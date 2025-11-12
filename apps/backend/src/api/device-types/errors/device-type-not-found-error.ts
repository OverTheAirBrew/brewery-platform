import { NotFoundException } from '@nestjs/common';

export class DeviceTypeNotFoundError extends NotFoundException {
  constructor(deviceTypeId: string) {
    super(`Device type ${deviceTypeId} not found`);
  }
}
