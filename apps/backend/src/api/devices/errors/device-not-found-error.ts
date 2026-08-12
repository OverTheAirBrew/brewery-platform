import { NotFoundException } from '@nestjs/common';

export class DeviceNotFoundError extends NotFoundException {
  constructor(deviceId: string) {
    super(`Device ${deviceId} not found`);
  }
}
