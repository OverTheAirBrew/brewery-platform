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

  async validateConfiguration(): Promise<boolean> {
    return true;
  }

  protected async processOn(): Promise<void> {
    this.currentState = 'on';
  }

  protected async processOff(): Promise<void> {
    this.currentState = 'off';
  }

  protected async processCurrentState(): Promise<{ state: ActorState }> {
    return {
      state: this.currentState,
    };
  }
}
