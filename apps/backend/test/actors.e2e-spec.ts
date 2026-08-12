import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestDeviceEntity } from './helpers/entity-helpers/device';
import { app, repositories } from './helpers/setup';

describe('ActorsController (e2e)', () => {
  it('/actors (POST)', async () => {
    const deviceId = await createTestDeviceEntity();

    const response = await request(app.getHttpServer())
      .post('/actors')
      .send({
        name: 'testing',
        type: 'TestingActor',
        device_id: deviceId,
        config: {
          int: 1,
        },
      });

    expect(response.status).toBe(201);

    const createdActor = await repositories.actors.findByPk(response.body.id);

    expect(createdActor).toBeDefined();
    expect(createdActor).not.toBeNull();
    expect(createdActor!.name).toBe('testing');
  });
});
