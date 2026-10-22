import { MqttMessage } from '@overtheairbrew/mqtt';

export class AddMqttUserMessage extends MqttMessage<{
  username: string;
  password: string;
  authorizeSubscribe?: string[];
  authorizePublish?: string[];
}> {
  readonly topic = 'platform/mqtt-server/add-user';
}
