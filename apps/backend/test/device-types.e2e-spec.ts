import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApplication } from './helpers/create-test-application';

describe('DeviceTypesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

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
