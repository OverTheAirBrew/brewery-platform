import {
  Actor,
  ActorState,
  IActorProps,
  MqttActor,
} from '@overtheairbrew/plugins';
import { FtssActorConfig, FtssDeviceConfig } from '../interfaces';

import { MqttService } from '../../../mqtt-client/mqtt-client.service';
import { Injectable } from '@nestjs/common';
import { FtssDeviceSwitchActor } from '../messages/FtssDeviceSwitchActor';

@Injectable()
export class FtssDeviceActor extends MqttActor<
  FtssDeviceConfig,
  FtssActorConfig
> {
  constructor(private readonly mqttService: MqttService) {
    super({});
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

  getTopics(params: IActorProps<FtssDeviceConfig, FtssActorConfig>) {
    return {
      publishTopics: [],
      subscribeTopics: [`ftss/${params.device.device_id}/actor/switch`],
    };
  }
}
