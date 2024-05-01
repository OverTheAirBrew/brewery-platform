import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApplication } from './helpers/create-test-application';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/users/login (GET)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'nick@overtheairbrew.com',
        password: 'password',
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      username: 'nick@overtheairbrew.com',
      emailHash: expect.any(String),
      token: expect.any(String),
    });
  });
});
