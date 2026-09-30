import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, repositories } from './helpers/setup';
import { createTestDeviceEntity } from './helpers/entity-helpers/device';

describe('SensorsController (e2e)', () => {
  it('/sensors (POST)', async () => {
    const deviceId = await createTestDeviceEntity();

    const response = await request(app.getHttpServer())
      .post('/sensors')
      .send({
        name: 'testing',
        type: 'LocalDeviceDummySensor',
        device_id: deviceId,
        config: {
          values: '1,2,3,4,5',
        },
      });

    expect(response.status).toBe(201);

    const createdSensor = await repositories.sensors.findByPk(response.body.id);

    expect(createdSensor).toBeDefined();
    expect(createdSensor).not.toBeNull();
    expect(createdSensor!.name).toBe('testing');
  });
});
