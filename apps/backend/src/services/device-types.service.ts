import { Inject, Injectable } from '@nestjs/common';
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

  private async mapDeviceType(device: Device<any>) {
    const properties = await device.getConfigOptions(undefined);
    return {
      name: device.name,
      properties,
    };
  }
}
