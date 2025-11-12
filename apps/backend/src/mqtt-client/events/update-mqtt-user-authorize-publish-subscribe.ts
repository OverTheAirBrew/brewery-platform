import { MqttMessage } from '../mqtt-client.service';

export class UpdateAuthorizePublishSubscribe extends MqttMessage<{
  username: string;
  authorizePublish?: string[];
  authorizeSubscribe?: string[];
}> {
  readonly topic = 'platform/mqtt-server/update-authorize-publish-subscribe';
}
