import { Inject, Injectable } from '@nestjs/common';
import { JsonSchemaGeneratorService } from '../../json-schema-generator/json-schema-generator.service';

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
    private readonly jsonSchemaGenerator: JsonSchemaGeneratorService,
  ) {}

  async getAll() {
    const deviceNames = this.devices.map((device) => device.name);

    const anyOfOutput = await Promise.all(
      this.devices.map(async (device) => {
        const propertyConfig = await device.getConfigOptions({});

        return await this.jsonSchemaGenerator.generateIfSchema(
          {
            properties: {
              type: {
                const: device.name,
              },
            },
          },
          propertyConfig,
        );
      }),
    );

    return await this.jsonSchemaGenerator.generateSchema(
      'Device Configuration',
      'Configuration for the selected device type',
      {
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
      {
        anyOf: anyOfOutput,
      },
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
