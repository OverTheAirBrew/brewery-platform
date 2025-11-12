import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './helpers/setup';

describe('Logic Types E2E Tests', () => {
  it('/logic-types (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/logic-types');

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject([
      {
        name: 'TestingLogic',
        properties: [],
      },
    ]);
  });
});
