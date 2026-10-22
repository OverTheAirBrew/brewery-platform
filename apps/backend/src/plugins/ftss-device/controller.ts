import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, MqttContext, Payload } from '@nestjs/microservices';
import { CustomQueue } from '../../internal-events/internal-events.service';
import { SensorReading } from '../../internal-events/events/sensor-reading';
import { QUEUE_NAME } from '../../api/telemetry/telemetry.abstractions';
import { FtssDeviceTemperatureReading } from './messages/FtssDeviceTemperatureReading';
import { MessagePattern } from '@overtheairbrew/plugins';

@Controller()
export class MqttProcessor {
  private readonly logger = new Logger(MqttProcessor.name);

  constructor(@Inject(QUEUE_NAME) private readonly queue: CustomQueue) {}

  @MessagePattern('ftss/+/sensor/+/reading')
  async processSensorReading(
    @Ctx() context: MqttContext,
    @Payload() message: FtssDeviceTemperatureReading,
  ) {
    try {
      const [_, device_id, __, sensor_id] = context.getTopic().split('/');
      await this.queue.sendMessage(
        new SensorReading({
          device_id,
          sensor_id,
          value: message.payload.value,
        }),
      );
    } catch (err) {
      this.logger.error('Failed to process sensor reading', err);
    }
  }
}
