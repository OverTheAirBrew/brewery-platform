import { Actor, ActorState, Form, IActorProps } from '@overtheairbrew/plugins';

export class TestingActor extends Actor<unknown, unknown> {
  constructor() {
    super(new Form().addString('test', { required: true }));
  }

  async validateConfiguration(
    deviceConfig: unknown,
    sensorConfig: unknown,
  ): Promise<boolean> {
    return true;
  }
  protected processOn(params: IActorProps<unknown, unknown>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected processOff(params: IActorProps<unknown, unknown>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected processIdle(params: IActorProps<unknown, unknown>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected processCurrentState(
    params: IActorProps<unknown, unknown>,
  ): Promise<{ state: ActorState }> {
    throw new Error('Method not implemented.');
  }
}
