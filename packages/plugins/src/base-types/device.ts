import { ClassType } from '../class-type';
import { Form } from '../input-types/form';
import { Actor } from './actor';
import { Sensor } from './sensor';

export interface IDevice<T> {
  getConfigOptions(config: T): Promise<any>;
  validateConfiguration(config: T): Promise<boolean>;

  actors: Actor<any, any>[];
  sensors: Sensor<any, any>[];
}

export const IDevice = class Dummy {} as ClassType<IDevice<any>>;

export abstract class Device<T> implements IDevice<T> {
  public name: string;

  constructor(private configOptions: Form = new Form()) {
    this.name = this.constructor.name;
  }

  abstract actors: Actor<any, any>[];
  abstract sensors: Sensor<any, any>[];

  async getConfigOptions(config: T): Promise<any> {
    return await this.configOptions.build(config);
  }

  abstract validateConfiguration(config: T): Promise<boolean>;
}
