import { ISensorProps, Sensor, Form } from '@overtheairbrew/plugins';

export class TestingSensor extends Sensor<any, any> {
  constructor() {
    super({
      form: new Form().addInteger('int', { required: true, defaultValue: 0 }),
      type: 'http',
    });
  }

  async validateConfiguration(
    deviceConfig: any,
    sensorConfig: any,
  ): Promise<boolean> {
    return true;
  }
  protected process(params: ISensorProps<any, any>): Promise<number | null> {
    throw new Error('Method not implemented.');
  }
}
