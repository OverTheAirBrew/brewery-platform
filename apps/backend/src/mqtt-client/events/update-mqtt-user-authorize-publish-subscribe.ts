import { MqttMessage } from '@overtheairbrew/mqtt';

export class UpdateAuthorizePublishSubscribe extends MqttMessage<{
  username: string;
  authorizePublish?: string[];
  authorizeSubscribe?: string[];
}> {
  readonly topic = 'platform/mqtt-server/update-authorize-publish-subscribe';
}
