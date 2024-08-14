import { Injectable } from '@nestjs/common';
import {
  Actor,
  ActorState,
  IActor,
  IActorProps,
} from '@overtheairbrew/plugins';
import { ILocalDeviceConfig } from '../../interfaces';

interface IDummyActorProps {}

@Injectable()
export class LocalDeviceDummyActor
  extends Actor<ILocalDeviceConfig, IDummyActorProps>
  implements IActor<ILocalDeviceConfig, IDummyActorProps>
{
  private currentState: 'on' | 'off' = 'off';

  constructor() {
    super();
  }

  async validateConfiguration(
    deviceConfig: ILocalDeviceConfig,
    sensorConfig: IDummyActorProps,
  ): Promise<boolean> {
    return true;
  }

  protected async processOn(
    params: IActorProps<ILocalDeviceConfig, IDummyActorProps>,
  ): Promise<void> {
    this.currentState = 'on';
  }

  protected async processOff(
    params: IActorProps<ILocalDeviceConfig, IDummyActorProps>,
  ): Promise<void> {
    this.currentState = 'off';
  }

  protected async processCurrentState(
    params: IActorProps<ILocalDeviceConfig, IDummyActorProps>,
  ): Promise<{ state: ActorState }> {
    return {
      state: this.currentState,
    };
  }
}
