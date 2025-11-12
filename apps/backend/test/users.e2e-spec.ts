import { app } from './helpers/setup';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('UsersController (e2e)', () => {
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
