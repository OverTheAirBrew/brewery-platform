import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAME } from './telemetry.abstractions';
import { TelemetryService } from './telemetry.service';
import { SensorReading } from '../../internal-events/events/sensor-reading';
import { Job } from 'bullmq';

/* istanbul ignore start */
@Processor(QUEUE_NAME.toString())
export class TelemetryProcessor extends WorkerHost {
  /* istanbul ignore stop */
  constructor(private readonly telemetryService: TelemetryService) {
    super();
  }

  async process(sensorReading: Job<SensorReading, any, string>): Promise<void> {
    await this.telemetryService.createTelemetry(sensorReading.data.payload);
  }
}
