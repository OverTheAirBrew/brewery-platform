import { Inject, Injectable, Logger } from '@nestjs/common';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Telemetry } from '../../data/entities/telemetry.entity';
import { SensorReadingPayload } from '../../internal-events/events/sensor-reading';
import { Sensor } from '../../data/entities/sensor.entity';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @Inject(REPOSITORIES.TelemetryRepository)
    private readonly telemetryRepository: typeof Telemetry,
    @Inject(REPOSITORIES.SensorRepository)
    private readonly sensorRepository: typeof Sensor,
  ) {}

  async createTelemetry(telemetry: SensorReadingPayload) {
    const sensor = await this.sensorRepository.findOne({
      where: {
        id: telemetry.sensor_id,
        device_id: telemetry.device_id,
      },
    });

    if (!sensor) {
      this.logger.warn(
        `Skipping telemetry creation: Sensor with ID ${telemetry.sensor_id} not found for device ID ${telemetry.device_id}`,
      );
      return null;
    }

    return this.telemetryRepository.create(telemetry);
  }
}
