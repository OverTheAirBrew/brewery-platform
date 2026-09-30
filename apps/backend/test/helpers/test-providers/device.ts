import {
  Actor,
  Device,
  Form,
  MqttDevice,
  Sensor,
  TopicResponse,
} from '@overtheairbrew/plugins';
import { TestingSensor } from './sensor';
import { TestingActor } from './actor';

export class TestingDevice extends Device<any> {
  actors: Actor<any, any>[] = [new TestingActor()];
  sensors: Sensor<any, any>[] = [new TestingSensor()];

  constructor(maxActors: number = Infinity, maxSensors: number = Infinity) {
    super({
      maxActors,
      maxSensors,
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

export class MqttTestingDevice extends MqttDevice<any> {
  actors: Actor<any, any>[] = [new TestingActor()];
  sensors: Sensor<any, any>[] = [new TestingSensor()];

  constructor(maxActors: number = Infinity, maxSensors: number = Infinity) {
    super({
      maxActors,
      maxSensors,
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

  getTopics(config: any): TopicResponse {
    return {
      publishTopics: [],
      subscribeTopics: [],
    };
  }
}
