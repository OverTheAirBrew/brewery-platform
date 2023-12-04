import { ClassType } from '../class-type';
import { Form } from '../input-types/form';

export interface IActorProps<TDevice, TProps> {
  device: TDevice;
  actor: TProps;
}

export interface IActor<TDevice, TProps> {
  on(params: IActorProps<TDevice, TProps>): Promise<void>;
  off(params: IActorProps<TDevice, TProps>): Promise<void>;
  getCurrentState(
    params: IActorProps<TDevice, TProps>
  ): Promise<{ state: ActorState }>;
  getConfigOptions(config: TDevice): Promise<any>;
}

export const IActor = class Dummy {} as ClassType<IActor<any, any>>;

export type ActorState = 'on' | 'off';

export abstract class Actor<TDevice, TProps>
  implements IActor<TDevice, TProps>
{
  public name: string;

  constructor(private configOptions: Form = new Form()) {
    this.name = this.constructor.name;
  }

  public async on(params: IActorProps<TDevice, TProps>) {
    await this.processOn(params);
  }

  public async off(params: IActorProps<TDevice, TProps>) {
    await this.processOff(params);
  }

  public async getCurrentState(params: IActorProps<TDevice, TProps>) {
    return await this.processCurrentState(params);
  }

  public async getConfigOptions(config: TDevice) {
    return await this.configOptions.build(config);
  }

  abstract validateConfiguration(
    deviceConfig: TDevice,
    sensorConfig: TProps
  ): Promise<boolean>;

  protected abstract processOn(
    params: IActorProps<TDevice, TProps>
  ): Promise<void>;
  protected abstract processOff(
    params: IActorProps<TDevice, TProps>
  ): Promise<void>;
  protected abstract processCurrentState(
    params: IActorProps<TDevice, TProps>
  ): Promise<{ state: ActorState }>;
}
