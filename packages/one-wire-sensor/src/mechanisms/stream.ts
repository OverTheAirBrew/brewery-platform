import { Injectable } from '@nestjs/common';
import { BaseController } from '../base-controller';
import { IOneWireController } from '../interfaces';

interface IStreamDevice {
  address: string;
  expectedValues: number[];
}

@Injectable()
export class StreamController
  extends BaseController
  implements IOneWireController
{
  private index = 0;

  constructor(
    private repeatable: boolean,
    private devices: IStreamDevice[],
  ) {
    super();
  }

  public async findDevices(hint?: string): Promise<string[]> {
    return this.devices.map((device) => device.address);
  }

  protected async readData(deviceName: string) {
    const values = this.devices.find(
      (dev) => dev.address === deviceName,
    )?.expectedValues;

    if (!values || !values.length || this.index === values.length) {
      throw new Error('No values');
    }

    try {
      return `${values[this.index]}`;
    } finally {
      this.index++;
      if (this.repeatable) {
        this.index %= values.length;
      }
    }
  }

  protected async parseData(rawData: string) {
    return parseInt(rawData);
  }
}
