import { describe, expect, it } from 'vitest';
import { app, repositories } from './helpers/setup';
import { QUEUE_NAME } from '../src/api/telemetry/telemetry.abstractions';
import { CustomQueue } from '../src/internal-events/internal-events.service';
import { SensorReading } from '../src/internal-events/events/sensor-reading';
import { createTestDeviceEntity } from './helpers/entity-helpers/device';
import { createTestSensorEntity } from './helpers/entity-helpers/sensor';
import { Telemetry } from '../src/data/entities/telemetry.entity';

describe('TelemetryProcessor (e2e)', () => {
  it('should process telemetry data', async () => {
    const test: CustomQueue = app.get(QUEUE_NAME);

    const deviceId = await createTestDeviceEntity();
    const sensorId = await createTestSensorEntity(deviceId);

    await test.sendMessage(
      new SensorReading({
        device_id: deviceId,
        sensor_id: sensorId,
        value: 42,
      }),
    );

    let telemetries: Telemetry[] = [];

    await expect
      .poll(
        async () => {
          telemetries = await repositories.telemetries.findAll({
            where: {
              device_id: deviceId,
            },
          });
          return telemetries;
        },
        {
          timeout: 5000,
          interval: 500,
        },
      )
      .toHaveLength(1);

    const [telemetry] = telemetries;
    expect(telemetry.device_id).toBe(deviceId);
    expect(telemetry.sensor_id).toBe(sensorId);
    expect(telemetry.value).toBe(42);
  });
});
