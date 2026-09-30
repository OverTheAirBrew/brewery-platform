import { Injectable } from '@nestjs/common';
import { MqttSensor, ISensorProps } from '@overtheairbrew/plugins';
import { FtssDeviceConfig, FtssSensorConfig } from '../interfaces';
import z from 'zod';

const sensorConfigSchema = z.object({});

@Injectable()
export class FtssDeviceSensor extends MqttSensor<
  FtssDeviceConfig,
  FtssSensorConfig
> {
  constructor() {
    super({});
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

  getTopics(params: ISensorProps<FtssDeviceConfig, FtssSensorConfig>) {
    return {
      publishTopics: [
        `ftss/${params.device.id}/sensor/${params.sensor.id}/reading`,
      ],
      subscribeTopics: [],
    };
  }
}
