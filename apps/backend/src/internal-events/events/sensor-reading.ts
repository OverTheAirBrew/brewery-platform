import { InternalEventMessage } from '../internal-events.service';

export type SensorReadingPayload = {
  device_id: string;
  sensor_id: string;
  value: number;
};

export class SensorReading extends InternalEventMessage<SensorReadingPayload> {
  public readonly topic = 'sensor.reading';

  constructor(payload: SensorReadingPayload) {
    super(payload);
  }
}
