import { NotFoundException } from '@nestjs/common';

export class SensorTypeNotFoundError extends NotFoundException {
  constructor(deviceTypeId: string, sensorTypeId: string) {
    super(
      `Sensor type ${sensorTypeId} not found for device type ${deviceTypeId}`,
    );
  }
}
