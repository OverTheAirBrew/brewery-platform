import { ClassType } from '../class-type';
import { Form } from '../input-types/form';
import { CommunicationType, TopicResponse } from './abstractions';

export interface IActorProps<TDevice, TProps> {
  device: TDevice;
  actor: TProps;
}

export interface IActor<TDevice, TProps> {
  on(params: IActorProps<TDevice, TProps>): Promise<void>;
  off(params: IActorProps<TDevice, TProps>): Promise<void>;
  getCurrentState(
    params: IActorProps<TDevice, TProps>,
  ): Promise<{ state: ActorState }>;
  getConfigOptions(config: TDevice): Promise<any>;
}

export const IActor = class Dummy {} as ClassType<IActor<any, any>>;

export type ActorState = 'on' | 'off' | 'idle';

type ActorConfigOptions = {
  form?: Form;
  communicationType?: CommunicationType;
};

export abstract class Actor<TDevice, TProps> implements IActor<
  TDevice,
  TProps
> {
  public name: string;
  private readonly form: Form;
  public readonly communicationType: CommunicationType;

  constructor(configOptions: ActorConfigOptions) {
    this.name = this.constructor.name;
    this.form = configOptions.form ?? new Form();
    this.communicationType =
      configOptions.communicationType ?? CommunicationType.None;
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
    return await this.form.build(config);
  }

  abstract validateConfiguration(
    deviceConfig: TDevice,
    sensorConfig: TProps,
  ): Promise<boolean>;

  protected abstract processOn(
    params: IActorProps<TDevice, TProps>,
  ): Promise<void>;
  protected abstract processOff(
    params: IActorProps<TDevice, TProps>,
  ): Promise<void>;
  protected abstract processCurrentState(
    params: IActorProps<TDevice, TProps>,
  ): Promise<{ state: ActorState }>;
}

export abstract class MqttActor<TDevice, TProps> extends Actor<
  TDevice,
  TProps
> {
  constructor(configOptions: Omit<ActorConfigOptions, 'communicationType'>) {
    super({
      ...configOptions,
      communicationType: CommunicationType.MQTT,
    });
  }

  abstract getTopics(params: IActorProps<TDevice, TProps>): TopicResponse;
}
