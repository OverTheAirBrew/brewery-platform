import { Actor, ActorState, IActorProps } from '@overtheairbrew/plugins';
import { FtssActorConfig, FtssDeviceConfig } from '../interfaces';

import {
  MqttMessage,
  MqttService,
} from '../../../mqtt-client/mqtt-client.service';
import { Injectable } from '@nestjs/common';

type FtssDeviceActorMessagePayload = {
  device_id: string;
  state: ActorState;
};

class FtssDeviceActorMessage extends MqttMessage<FtssDeviceActorMessagePayload> {
  public readonly topic = (payload: FtssDeviceActorMessagePayload) =>
    `ftss/${payload.device_id}/actor/command`;
}

@Injectable()
export class FtssDeviceActor extends Actor<FtssDeviceConfig, FtssActorConfig> {
  constructor(private readonly mqttService: MqttService) {
    super();
  }

  protected async processOn(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<void> {
    this.mqttService.sendMessage(
      new FtssDeviceActorMessage({
        device_id: params.device.device_id,
        state: 'on',
      }),
    );
  }

  protected async processOff(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<void> {
    this.mqttService.sendMessage(
      new FtssDeviceActorMessage({
        device_id: params.device.device_id,
        state: 'off',
      }),
    );
  }

  protected async processIdle(
    params: IActorProps<FtssDeviceConfig, FtssActorConfig>,
  ): Promise<void> {
    this.mqttService.sendMessage(
      new FtssDeviceActorMessage({
        device_id: params.device.device_id,
        state: 'idle',
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
