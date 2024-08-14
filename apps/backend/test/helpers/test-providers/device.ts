import { Actor, Device, Form, Sensor } from '@overtheairbrew/plugins';

export class TestingDevice extends Device<any> {
  actors: Actor<any, any>[];
  sensors: Sensor<any, any>[];

  constructor() {
    super(
      new Form()
        .addInteger('int', { required: true, defaultValue: 0 })
        .addSelectBox('select', {
          required: true,
          values: ['a', 'b', 'c'],
          defaultValue: 'a',
        })
        .addString('text', { required: true }),
    );
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }
}
