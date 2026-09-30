import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app, repositories } from '../helpers/setup';
import { MqttService } from '../../src/mqtt-client/mqtt-client.service';
import { MqttMessage } from '@overtheairbrew/mqtt';
import { createTestSensorEntity } from '../helpers/entity-helpers/sensor';
import { createTestDeviceEntity } from '../helpers/entity-helpers/device';
import { FtssDeviceTemperatureReading } from '../../src/plugins/ftss-device/messages/FtssDeviceTemperatureReading';
import { Telemetry } from '../../src/data/entities/telemetry.entity';

describe('FTSS Plugin E2E Tests', () => {
  it('should perform a sample test', async () => {
    const mqttService = app.get<MqttService>(MqttService);

    const deviceId = await createTestDeviceEntity();
    const sensorId = await createTestSensorEntity(deviceId);

    mqttService.sendMessage(
      new FtssDeviceTemperatureReading({
        device_id: deviceId,
        sensor_id: sensorId,
        value: 10,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const telemetry = await repositories.telemetries.findAll({
      where: { device_id: deviceId, sensor_id: sensorId },
    });

    expect(telemetry).toHaveLength(1);
  }, 100000);
});
