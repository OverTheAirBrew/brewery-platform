import { Temperature } from './models/temperature';

export abstract class BaseController {
  public async getCurrentValue(deviceName: string) {
    const rawData = await this.readData(deviceName);
    const parsedData = await this.parseData(rawData);
    return new Temperature(parsedData);
  }

  protected abstract readData(deviceName: string): Promise<string>;
  protected abstract parseData(rawData: string): Promise<number>;
}
