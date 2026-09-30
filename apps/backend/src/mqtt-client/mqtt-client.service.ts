import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_SERVICE } from './mqtt-client.abstractions';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';
import { MqttMessage } from '@overtheairbrew/mqtt';

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
    this.mqttClient.emit(fullTopic, message);
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
