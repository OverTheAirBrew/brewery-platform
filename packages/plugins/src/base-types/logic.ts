import { ClassType } from '../class-type';
import { Form } from '../input-types/form';

export interface ILogic<T> {
  run: (
    params: T,
    currentTemp: number,
    targetTemp: number,
  ) => Promise<{ heatTime: number; waitTime: number; nextParams: T }>;
  getConfigOptions(config: T): Promise<any>;
}

export const ILogic = class Dummy {} as ClassType<ILogic<any>>;

export abstract class Logic<T> implements ILogic<T> {
  public name: string;

  constructor(private configOptions: Form = new Form()) {
    this.name = this.constructor.name;
  }

  public async run(params: T, currentTemp: number, targetTemp: number) {
    return await this.process(params, currentTemp, targetTemp);
  }

  public async getConfigOptions(config: T) {
    return await this.configOptions.build(config);
  }

  protected abstract process(
    params: T,
    currentTemp: number,
    targetTemp: number,
  ): Promise<{ heatTime: number; waitTime: number; nextParams: T }>;
}
