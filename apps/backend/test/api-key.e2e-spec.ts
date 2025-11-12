import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, repositories } from './helpers/setup';

describe('ApiKeyController (e2e)', () => {
  it('POST /api-keys', async () => {
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

  it('PATCH /api-keys/:apiKeyId', async () => {
    const { id } = await repositories.apiKeys.create({
      key: 'testing-key',
      name: 'testing-key',
    });

    const response = await request(app.getHttpServer())
      .patch(`/api-keys/${id}`)
      .send();

    expect(response.status).toBe(200);

    const updatedApiKey = await repositories.apiKeys.findByPk(id);

    expect(updatedApiKey).toMatchObject({
      id,
      key: expect.not.stringContaining('testing-key'),
      name: 'testing-key',
    });
  });
});
