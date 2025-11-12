import { ClassType } from '../class-type';
import { Form, InputType } from '../input-types/form';
import { Actor } from './actor';
import { Sensor } from './sensor';

export interface IDevice<T> {
  getConfigOptions(config: T): Promise<any>;
  validateConfiguration(config: T): Promise<boolean>;

  actors: Actor<any, any>[];
  sensors: Sensor<any, any>[];
}

export const IDevice = class Dummy {} as ClassType<IDevice<any>>;

export enum RequiredCredentials {
  None = 'none',
  MQTT = 'mqtt',
}

export abstract class Device<T> implements IDevice<T> {
  public name: string;

  private readonly form: Form;
  public readonly requiredCredentials: RequiredCredentials;

  private readonly maxActors: number;
  private readonly maxSensors: number;

  constructor(configOptions: {
    form?: Form;
    requiredCredentials?: RequiredCredentials;
    maxActors?: number;
    maxSensors?: number;
  }) {
    this.name = this.constructor.name;
    this.form = configOptions.form ?? new Form();
    this.requiredCredentials =
      configOptions.requiredCredentials ?? RequiredCredentials.None;
    this.maxActors = configOptions.maxActors || Infinity;
    this.maxSensors = configOptions.maxSensors || Infinity;
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
