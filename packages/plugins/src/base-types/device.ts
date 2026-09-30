import { ClassType } from '../class-type';
import { Form, InputType } from '../input-types/form';
import { Actor } from './actor';
import { CommunicationType, TopicResponse } from './abstractions';
import { Sensor } from './sensor';

export interface IDevice<T> {
  getConfigOptions(config: T): Promise<any>;
  validateConfiguration(config: T): Promise<boolean>;

  actors: Actor<any, any>[];
  sensors: Sensor<any, any>[];
}

export const IDevice = class Dummy {} as ClassType<IDevice<any>>;

type DeviceConfigOptions = {
  form?: Form;
  maxActors?: number;
  maxSensors?: number;
  connectionType?: CommunicationType;
};

export abstract class Device<T> implements IDevice<T> {
  public name: string;

  private readonly form: Form;
  private readonly maxActors: number;
  private readonly maxSensors: number;

  public readonly connectionType: CommunicationType;

  constructor(configOptions: DeviceConfigOptions) {
    this.name = this.constructor.name;
    this.form = configOptions.form ?? new Form();
    this.maxActors = configOptions.maxActors || Infinity;
    this.maxSensors = configOptions.maxSensors || Infinity;
    this.connectionType =
      configOptions.connectionType ?? CommunicationType.None;
  }

  abstract actors: Actor<any, any>[];
  abstract sensors: Sensor<any, any>[];

  async getConfigOptions(config: T): Promise<InputType[]> {
    return await this.form.build(config);
  }

  validateActorCount(currentCount: number): boolean {
    return currentCount >= this.maxActors;
  }

  validateSensorCount(currentCount: number): boolean {
    return currentCount >= this.maxSensors;
  }

  abstract validateConfiguration(config: T): Promise<boolean>;
}

export abstract class MqttDevice<T> extends Device<T> {
  constructor(configOptions: Omit<DeviceConfigOptions, 'connectionType'>) {
    super({
      ...configOptions,
      connectionType: CommunicationType.MQTT,
    });
  }

  abstract getTopics(config: T): TopicResponse;
}
