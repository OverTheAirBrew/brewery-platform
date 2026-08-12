import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestDeviceEntity } from './helpers/entity-helpers/device';
import { createTestSensorEntity } from './helpers/entity-helpers/sensor';
import { createTestActorEntity } from './helpers/entity-helpers/actor';
import { app, repositories } from './helpers/setup';

describe('Vessels (e2e)', () => {
  it('should create a kettle', async () => {
    const deviceId = await createTestDeviceEntity();
    const sensorId = await createTestSensorEntity(deviceId);
    const actorId = await createTestActorEntity(deviceId);

    const response = await request(app.getHttpServer()).post('/vessels').send({
      name: 'Test Kettle',
      type: 'kettle',
      device_id: deviceId,
      sensor_id: sensorId,
      heater_id: actorId,
      logicType_id: 'TestingLogic',
      logicConfig: {},
      targetTemp: 100,
    });

    expect(response.status).toBe(201);

    const createdVessel = await repositories.vessels.findByPk(response.body.id);

    expect(createdVessel).not.toBeNull();
    expect(createdVessel!.name).toBe('Test Kettle');
    expect(createdVessel!.type).toBe('kettle');
    expect(createdVessel!.sensor_id).toBe(sensorId);
    expect(createdVessel!.heater_id).toBe(actorId);
    expect(createdVessel!.cooler_id).toBeNull();
    expect(createdVessel!.logicType_id).toBe('TestingLogic');
  });
});
