import { Temperature } from './models/temperature';

export interface IOneWireController {
  findDevices(hint?: string): Promise<string[]>;
  getCurrentValue(deviceName: string): Promise<Temperature>;
}

export interface ClassType<T = any> {
  new (...args: any[]): T;
}

export const IOneWireController =
  class Dummy {} as ClassType<IOneWireController>;
