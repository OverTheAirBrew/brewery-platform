// This file is auto-generated. Do not edit manually.

import z from 'zod';
import { MqttMessage } from '@overtheairbrew/mqtt';

export const FtssDeviceTemperatureReadingSchema = z.object({
  value: z.number(),
  device_id: z.string(),
  sensor_id: z.string(),
});

export type FtssDeviceTemperatureReadingType = z.infer<
  typeof FtssDeviceTemperatureReadingSchema
>;

export class FtssDeviceTemperatureReading extends MqttMessage<FtssDeviceTemperatureReadingType> {
  protected topic = (payload: FtssDeviceTemperatureReadingType) =>
    `ftss/${payload.device_id}/sensor/${payload.sensor_id}/temperature`;

  constructor(data: FtssDeviceTemperatureReadingType) {
    super(data);
  }
}
