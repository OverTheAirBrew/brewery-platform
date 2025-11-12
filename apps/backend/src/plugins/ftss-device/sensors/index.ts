import { Injectable } from '@nestjs/common';
import { Form, Sensor } from '@overtheairbrew/plugins';
import { FtssDeviceConfig, FtssSensorConfig } from '../interfaces';
import z from 'zod';

const sensorConfigSchema = z.object({});

@Injectable()
export class FtssDeviceSensor extends Sensor<
  FtssDeviceConfig,
  FtssSensorConfig
> {
  constructor() {
    super({
      type: 'mqtt',
    });
  }

  async validateConfiguration(
    deviceConfig: FtssDeviceConfig,
    sensorConfig: FtssSensorConfig,
  ): Promise<boolean> {
    sensorConfigSchema.parse(sensorConfig);
    return true;
  }

  protected async process(): Promise<number | null> {
    return null;
  }
}
