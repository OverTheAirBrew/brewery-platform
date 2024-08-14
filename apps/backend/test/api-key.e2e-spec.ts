import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('ApiKeyController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/api-keys (POST)', async () => {
    const response = await request(app.getHttpServer()).post(`/api-keys`).send({
      name: 'testing-key',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      key: expect.stringContaining('OTA_'),
      name: 'testing-key',
    });

    const displayApiKeys = await repositories.apiKeys.findAll({});

    expect(displayApiKeys).toHaveLength(1);
  });
});
