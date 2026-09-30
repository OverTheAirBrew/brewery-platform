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

  constructor(@Inject(MQTT_SERVICE) private readonly mqttClient: ClientProxy) {}

  sendMessage<TPayload>(message: MqttMessage<TPayload>) {
    const topic = message.getTopic(message.payload);

    this.logger.debug(`Sending MQTT message to topic: ${topic}`);
    this.mqttClient.emit(topic, message);
    // this.mqttClient.send(topic, message.payload);
  }

  async onApplicationBootstrap() {
    await this.mqttClient.connect();
  }
}
