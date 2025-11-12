import { Injectable } from '@nestjs/common';
import { sync } from 'fast-glob';
import { existsSync, readFileSync } from 'fs';
import { normalize } from 'path';
import { BaseController } from '../base-controller';
import { IOneWireController } from '../interfaces';

@Injectable()
export class DS18B20Controller
  extends BaseController
  implements IOneWireController
{
  private patternStart = '/sys/bus/w1/devices/';
  private patternEnd = '/w1_slave';

  constructor() {
    super();
  }

  public async findDevices(): Promise<string[]> {
    const pattern = await this.generatePattern();
    const files = sync(pattern);
    const normalizedFiles = files.map((file) => normalize(file));
    return normalizedFiles.map((f) =>
      f.replace(this.patternStart, '').replace(this.patternEnd, ''),
    );
  }

  private async generatePattern(address: string = '28-*') {
    return `${this.patternStart}${address}${this.patternEnd}`;
  }

  protected async readData(address: string) {
    const devicePattern = await this.generatePattern(address);

    if (!existsSync(devicePattern)) {
      throw new Error('One wire device not found');
    }

    return readFileSync(devicePattern).toString('utf-8');
  }

  protected async parseData(rawData: string) {
    const data = rawData.split('t=');

    if (data.length !== 2) {
      throw new Error('Raw data is not in the expected format');
    }

    return parseInt(data[1].replace('\n', '')) / 1000;
  }
}
