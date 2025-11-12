import { BadRequestException } from '@nestjs/common';

export class MaximumActorsForDeviceError extends BadRequestException {
  constructor(deviceType: string) {
    super(`Maximum number of actors exceeded for device type ${deviceType}`);
  }
}
