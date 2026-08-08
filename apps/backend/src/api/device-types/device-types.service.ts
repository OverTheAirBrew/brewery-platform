import { Inject, Injectable } from '@nestjs/common';
import { DeviceTypeSchema } from '@overtheairbrew/models';

import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypeNotFoundError } from './errors/device-type-not-found-error';

/* istanbul ignore start */
@Injectable()
export class DeviceTypesService {
  /* istanbul ignore stop */
  constructor(
    @Inject(DeviceIdentifier) private readonly devices: Device<any>[],
  ) {}

  async getAll() {
    return await Promise.all(
      this.devices.map((device) => this.mapDeviceType(device)),
    );
  }

  async getByNameRaw(name: string) {
    const device = this.devices.find((device) => device.name === name);
    if (!device) {
      throw new DeviceTypeNotFoundError(name);
    }
    return device;
  }

  private async mapDeviceType(device: Device<any>) {
    const properties = await device.getConfigOptions(undefined);

    return DeviceTypeSchema.parse({
      name: device.name,
      properties,
    });
  }
}
