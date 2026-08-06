import { Actor, Device, Form, Sensor } from '@overtheairbrew/plugins';
import { TestingSensor } from './sensor';
import { TestingActor } from './actor';

export class TestingDevice extends Device<any> {
  actors: Actor<any, any>[] = [new TestingActor()];
  sensors: Sensor<any, any>[] = [new TestingSensor()];

  constructor() {
    super({
      form: new Form()
        .addInteger('int', { required: true, defaultValue: 0 })
        .addSelectBox('select', {
          required: true,
          values: ['a', 'b', 'c'],
          defaultValue: 'a',
        })
        .addString('text', { required: true }),
    });
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }
}
