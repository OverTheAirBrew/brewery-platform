import { Inject, Injectable } from '@nestjs/common';

import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypeNotFoundError } from './errors/device-type-not-found-error';

import { RJSFSchema } from '@rjsf/utils';
import type { JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import { DeviceTypeSchema } from '@overtheairbrew/models';

/* istanbul ignore start */
@Injectable()
export class DeviceTypesService {
  /* istanbul ignore stop */
  constructor(
    @Inject(DeviceIdentifier) private readonly devices: Device<any>[],
  ) {}

  async getAll() {
    return this.testing();
    // return await Promise.all(
    //   this.devices.map((device) => this.mapDeviceType(device)),
    // );
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

  public async testing(): Promise<RJSFSchema> {
    const deviceNames = this.devices.map((device) => device.name);

    const test = await Promise.all(
      this.devices.map(async (device) => {
        const propertyConfig = await device.getConfigOptions({});

        return {
          if: {
            properties: {
              type: {
                const: device.name,
              },
            },
          },
          then: propertyConfig,
        } satisfies JSONSchema7Definition;
      }),
    );

    return {
      title: 'Device Configuration',
      description: 'Configuration for the selected device type',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: 'Device Name',
        },
        type: {
          type: 'string',
          title: 'Device Type',
          enum: deviceNames,
        },
      },
      anyOf: [...test],
    };
  }
}
