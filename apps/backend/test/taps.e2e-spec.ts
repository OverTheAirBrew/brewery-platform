import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('TapsController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/taps (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/taps').send({
      name: 'TestingTap',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: expect.any(String) });
  });

  it('/taps (GET)', async () => {
    const { id } = await repositories.taps.create({
      name: 'TestingTap',
    });

    const response = await request(app.getHttpServer()).get('/taps');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject([
      {
        id,
        name: 'TestingTap',
      },
    ]);
  });

  it('/taps/:tapId (GET)', async () => {
    const { id } = await repositories.taps.create({
      name: 'TestingTap',
    });

    const response = await request(app.getHttpServer()).get(`/taps/${id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id,
      name: 'TestingTap',
    });
  });

  it('/taps/:tapId (PUT)', async () => {
    const { id } = await repositories.taps.create({
      name: 'TestingTap',
    });

    const response = await request(app.getHttpServer())
      .put(`/taps/${id}`)
      .send({
        name: 'UpdatedTap',
      });

    expect(response.status).toBe(204);

    const tap = await repositories.taps.findByPk(id);
    expect(tap).toMatchObject({
      id,
      name: 'UpdatedTap',
    });
  });
});
