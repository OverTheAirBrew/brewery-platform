import { Inject, Injectable } from '@nestjs/common';
import {
  Actor,
  ActorIdentifier,
  Form,
  MqttDevice,
  Sensor,
  SensorIdentifier,
} from '@overtheairbrew/plugins';
import { FtssDeviceConfig } from './interfaces';
import z from 'zod';

const configSchema = z.object({
  device_id: z
    .string({
      error: 'Device ID is required',
    })
    .min(1),
});

@Injectable()
export class FtssDevice extends MqttDevice<FtssDeviceConfig> {
  constructor(
    @Inject(ActorIdentifier) public actors: Actor<any, any>[],
    @Inject(SensorIdentifier) public sensors: Sensor<any, any>[],
  ) {
    super({
      form: new Form().addString('deviceId', { required: true }),
      maxSensors: 1,
      maxActors: 2,
    });
  }

  async validateConfiguration(config: FtssDeviceConfig) {
    try {
      await configSchema.parseAsync(config);
      return true;
    } catch {
      return false;
    }
  }

  getTopics() {
    return {
      publishTopics: [],
      subscribeTopics: [],
    };
  }
}
