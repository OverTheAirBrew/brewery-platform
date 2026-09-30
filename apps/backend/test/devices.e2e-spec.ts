import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, repositories } from './helpers/setup';
import { createTestDeviceEntity } from './helpers/entity-helpers/device';

describe('DevicesController (e2e)', () => {
  it('/devices (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/devices').send({
      name: 'testing',
      type: 'LocalDevice',
      config: {},
    });

    expect(response.status).toBe(201);

    const createdDevice = await repositories.devices.findByPk(response.body.id);

    expect(createdDevice).toBeDefined();
    expect(createdDevice).not.toBeNull();
    expect(createdDevice!.name).toBe('testing');
  });

  it('/devices/:id/sensor-types (GET)', async () => {
    const deviceId = await createTestDeviceEntity();

    const response = await request(app.getHttpServer()).get(
      `/devices/${deviceId}/sensor-types`,
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual([
      {
        name: 'LocalDeviceDummySensor',
        properties: [
          {
            name: 'values',
            placeholder: '',
            required: true,
            type: 'string',
          },
        ],
      },
    ]);
  });

  it('/devices/:id/actor-types (GET)', async () => {
    const deviceId = await createTestDeviceEntity();

    const response = await request(app.getHttpServer()).get(
      `/devices/${deviceId}/actor-types`,
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual([
      {
        name: 'LocalDeviceDummyActor',
        properties: [],
      },
    ]);
  });
});
