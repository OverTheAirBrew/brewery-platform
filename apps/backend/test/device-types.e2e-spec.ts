import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from './helpers/setup';

describe('DeviceTypesController (e2e)', () => {
  it('/device-types (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/device-types');

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject([
      {
        name: 'FtssDevice',
        properties: [
          {
            name: 'deviceId',
            placeholder: '',
            required: true,
            type: 'string',
          },
        ],
      },
      {
        name: 'LocalDevice',
        properties: [],
      },
    ]);
  });
});
