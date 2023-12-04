import { ClassType } from '../class-type';
import { Form } from '../input-types/form';

export interface ISensorProps<TDevice, TProps> {
  device: TDevice;
  sensor: TProps;
}

export interface ISensor<TDevice, TProps> {
  run(params: ISensorProps<TDevice, TProps>): Promise<number | null>;
  getConfigOptions(config: TDevice): Promise<any>;
}

export const ISensor = class Dummy {} as ClassType<ISensor<any, any>>;

export abstract class Sensor<TDevice, TProps>
  implements ISensor<TDevice, TProps>
{
  public name: string;

  constructor(private configOptions: Form = new Form()) {
    this.name = this.constructor.name;
  }

  public async run(params: ISensorProps<TDevice, TProps>) {
    return await this.process(params);
  }

  public async getConfigOptions(config: TDevice) {
    return await this.configOptions.build(config);
  }

  abstract validateConfiguration(
    deviceConfig: TDevice,
    sensorConfig: TProps
  ): Promise<boolean>;

  protected abstract process(
    params: ISensorProps<TDevice, TProps>
  ): Promise<number | null>;
}
