import { Inject, Injectable } from '@nestjs/common';
import {
  Actor,
  ActorIdentifier,
  Device,
  Form,
  RequiredCredentials,
  Sensor,
  SensorIdentifier,
} from '@overtheairbrew/plugins';
import { FtssDeviceConfig } from './interfaces';
import z from 'zod';

const configSchema = z.object({
  device_id: z.string({
    error: 'Device ID is required',
  }),
});

@Injectable()
export class FtssDevice extends Device<FtssDeviceConfig> {
  constructor(
    @Inject(ActorIdentifier) public actors: Actor<any, any>[],
    @Inject(SensorIdentifier) public sensors: Sensor<any, any>[],
  ) {
    super({
      form: new Form().addString('deviceId', { required: true }),
      requiredCredentials: RequiredCredentials.MQTT,
      maxSensors: 1,
      maxActors: 2,
    });
  }

  async validateConfiguration(config: FtssDeviceConfig) {
    configSchema.parse(config);
    return true;
  }

  async getMqttSendRecieveTopics() {}
}
