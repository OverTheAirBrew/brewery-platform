import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_SERVICE } from './mqtt-client.abstractions';

export abstract class MqttMessage<TPayload> {
  protected readonly __mqtttMessageBrand!: void;

  protected abstract readonly topic: string | ((payload: TPayload) => string);

  public getTopic(payload: TPayload): string {
    if (typeof this.topic === 'string') {
      return this.topic;
    }

    return this.topic(payload);
  }

  constructor(public readonly payload: TPayload) {}
}

@Injectable()
export class MqttService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MqttService.name);

  constructor(@Inject(MQTT_SERVICE) private readonly mqttClient: ClientProxy) {}

  sendMessage<TPayload>(message: MqttMessage<TPayload>) {
    const topic = message.getTopic(message.payload);

    this.logger.debug(`Sending MQTT message to topic: ${topic}`);
    this.mqttClient.emit(topic, message.payload);
  }

  async onApplicationBootstrap() {
    await this.mqttClient.connect();
  }
}
