import { ClassType } from '../class-type';
import { Form } from '../input-types/form';
import { CommunicationType, TopicResponse } from './abstractions';

export interface ISensorProps<TDevice, TProps> {
  device: TDevice;
  sensor: TProps;
}

export interface ISensor<TDevice, TProps> {
  run(params: ISensorProps<TDevice, TProps>): Promise<number | null>;
  getConfigOptions(config: TDevice): Promise<any>;
}

export const ISensor = class Dummy {} as ClassType<ISensor<any, any>>;

type SensorConfigOptions = {
  form?: Form;
  connectionType?: CommunicationType;
};

export abstract class Sensor<TDevice, TProps> implements ISensor<
  TDevice,
  TProps
> {
  public name: string;

  public readonly form: Form = new Form();
  public readonly connectionType: CommunicationType;

  constructor(options: SensorConfigOptions) {
    this.name = this.constructor.name;
    this.form = options?.form ?? new Form();
    this.connectionType = options.connectionType ?? CommunicationType.None;
  }

  public async run(params: ISensorProps<TDevice, TProps>) {
    return await this.process(params);
  }

  public async getConfigOptions(config: TDevice) {
    return await this.form.build(config);
  }

  abstract validateConfiguration(
    deviceConfig: TDevice,
    sensorConfig: TProps,
  ): Promise<boolean>;

  protected abstract process(
    params: ISensorProps<TDevice, TProps>,
  ): Promise<number | null>;
}

export abstract class MqttSensor<TDevice, TProps> extends Sensor<
  TDevice,
  TProps
> {
  constructor(options: Omit<SensorConfigOptions, 'connectionType'>) {
    super({
      ...options,
      connectionType: CommunicationType.MQTT,
    });
  }

  abstract getTopics(params: ISensorProps<TDevice, TProps>): TopicResponse;
}
