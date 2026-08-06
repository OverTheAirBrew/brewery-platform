import { Inject, Injectable } from '@nestjs/common';
import { DeviceTypeSchema } from '@overtheairbrew/models';

import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';

@Injectable()
export class DeviceTypesService {
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
      return null;
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
