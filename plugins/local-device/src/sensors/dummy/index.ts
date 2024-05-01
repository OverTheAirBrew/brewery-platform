import { Injectable } from '@nestjs/common';
import { Form, ISensorProps, Sensor } from '@overtheairbrew/plugins';
import { ILocalDeviceConfig } from '../../interfaces';

interface IDummySensorProps {
  values: string;
}

@Injectable()
export class LocalDeviceDummySensor extends Sensor<
  ILocalDeviceConfig,
  IDummySensorProps
> {
  constructor() {
    super(
      new Form().addString('values', {
        required: true,
      }),
    );
  }

  async validateConfiguration(
    deviceConfig: ILocalDeviceConfig,
    sensorConfig: IDummySensorProps,
  ): Promise<boolean> {
    return await this.validateValues(sensorConfig.values);
  }

  protected async process(
    params: ISensorProps<ILocalDeviceConfig, IDummySensorProps>,
  ): Promise<number | null> {
    const values = params.sensor.values
      .split(',')
      .map((val: any) => parseInt(val));

    return values[Math.floor(Math.random() * values.length)];
  }

  private async validateValues(values: string) {
    if (!values) return false;

    const valuesSplit = values.split(',');
    return valuesSplit.every((val) => parseInt(val) || false);
  }
}
