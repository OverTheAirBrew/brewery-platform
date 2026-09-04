import { Actor, ActorState, IActorProps } from '@overtheairbrew/plugins';
import { FtssActorConfig, FtssDeviceConfig } from '../interfaces';

import { MqttService } from '../../../mqtt-client/mqtt-client.service';
import { Injectable } from '@nestjs/common';
import { FtssDeviceSwitchActor } from '../../../__generated__';

type FtssDeviceActorMessagePayload = {
  device_id: string;
  state: ActorState;
};

@Injectable()
export class FtssDeviceActor extends Actor<FtssDeviceConfig, FtssActorConfig> {
  constructor(private readonly mqttService: MqttService) {
    super();
  }

  protected async processOn(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<void> {
    this.mqttService.sendMessage(
      new FtssDeviceSwitchActor({
        actor_id: params.actor.id,
        device_id: params.device.device_id,
        state: 'on',
      }),
    );
  }

  protected async processOff(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<void> {
    this.mqttService.sendMessage(
      new FtssDeviceSwitchActor({
        actor_id: params.actor.id,
        device_id: params.device.device_id,
        state: 'off',
      }),
    );
  }

  protected processCurrentState(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<{ state: ActorState }> {
    throw new Error('Method not implemented.');
  }

  async validateConfiguration(
    deviceConfig: FtssDeviceConfig,
    sensorConfig: FtssActorConfig,
  ): Promise<boolean> {
    return true;
  }
}
