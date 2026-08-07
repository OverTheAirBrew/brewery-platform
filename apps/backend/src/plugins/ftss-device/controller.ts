import { applyDecorators, Controller, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { CustomQueue } from '../../internal-events/internal-events.service';
import { SensorReading } from '../../internal-events/events/sensor-reading';
import { QUEUE_NAME } from '../../api/telemetry/telemetry.abstractions';

const TestMessagePattern = (pattern: string) => {
  const messageDecorator = process.env.MQTT_PREFIX
    ? MessagePattern(`${process.env.MQTT_PREFIX}/${pattern}`)
    : MessagePattern(pattern);

  return applyDecorators(messageDecorator);
};

@Controller()
export class MqttProcessor {
  constructor(@Inject(QUEUE_NAME) private readonly queue: CustomQueue) {}

  @TestMessagePattern('ftss/+/sensor/+/reading')
  async processSensorReading(
    @Ctx() context: MqttContext,
    @Payload() message: { value: number },
  ) {
    const [_, device_id, __, sensor_id] = context.getTopic().split('/');
    await this.queue.sendMessage(
      new SensorReading({
        device_id,
        sensor_id,
        value: message.value,
      }),
    );
  }
}
