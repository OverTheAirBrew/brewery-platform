import { Inject, Injectable } from '@nestjs/common';
import {
  Actor,
  ActorIdentifier,
  Device,
  Sensor,
  SensorIdentifier,
} from '@overtheairbrew/plugins';
import { ILocalDeviceConfig } from './interfaces';

@Injectable()
export class LocalDevice extends Device<ILocalDeviceConfig> {
  constructor(
    @Inject(ActorIdentifier) public actors: Actor<any, any>[],
    @Inject(SensorIdentifier) public sensors: Sensor<any, any>[],
  ) {
    super();
  }

  async validateConfiguration(config: ILocalDeviceConfig) {
    return Object.keys(config).length === 0;
  }
}
