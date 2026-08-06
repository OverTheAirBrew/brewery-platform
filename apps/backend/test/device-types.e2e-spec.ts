import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from './helpers/setup';

describe('DeviceTypesController (e2e)', () => {
  it('/device-types (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/device-types');

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject([
      {
        name: 'TestingDevice',
        properties: [
          { name: 'int', type: 'number', required: true, defaultValue: 0 },
          {
            name: 'select',
            type: 'select-box',
            required: true,
            values: ['a', 'b', 'c'],
            defaultValue: 'a',
          },
          { name: 'text', type: 'string', required: true, placeholder: '' },
        ],
      },
    ]);
  });
});
