import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import {
  ClientProxy,
  MqttRecordBuilder,
  MqttRecordOptions,
} from '@nestjs/microservices';
import { MQTT_SERVICE } from './mqtt-client.abstractions';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';
import { MqttMessage } from '@overtheairbrew/mqtt';
import { randomUUID } from 'crypto';

@Injectable()
export class MqttService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MqttService.name);
  private postfix: string | undefined;

  constructor(
    @Inject(MQTT_SERVICE) private readonly mqttClient: ClientProxy,
    configService: ConfigService,
  ) {
    const config = configService.get<ConfigType>('CONFIG');
    this.postfix = config!.mqtt.MQTT_POSTFIX || undefined;
  }

  sendMessage<TPayload>(message: MqttMessage<TPayload>) {
    const topic = message.getTopic(message.payload);
    const fullTopic = this.getTopic(topic);

    this.logger.debug(`Sending MQTT message to topic: ${fullTopic}`);

    const record = new MqttRecordBuilder({
      ...message,
      messageId: randomUUID(), // messageId here so it can be tracked uniquely for each message
      sentAt: Date.now(),
    })
      .setQoS(message.options.qos as MqttRecordOptions['qos'])
      .setRetain(message.options?.retain ?? false)
      .build();

    this.mqttClient.emit(fullTopic, record);
  }

  async onApplicationBootstrap() {
    await this.mqttClient.connect();
  }

  private getTopic(topic: string) {
    if (this.postfix) {
      return `${topic}/${this.postfix}`;
    }
    return topic;
  }
}
