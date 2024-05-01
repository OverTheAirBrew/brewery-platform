import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('ProducersController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/producers (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/producers')
      .send({
        name: 'TestingProducer',
      });

    expect(response.status).toBe(201);

    const createdProducer = await repositories.producers.findByPk(
      response.body.id,
    );

    expect(createdProducer).toBeDefined();
    expect(createdProducer!.toJSON()).toMatchObject({
      id: response.body.id,
      name: 'TestingProducer',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('/producers (GET)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    const response = await request(app.getHttpServer()).get('/producers');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id,
          name: 'TestingProducer',
        }),
      ]),
    );
  });

  it('/producers/:id (GET)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    const response = await request(app.getHttpServer()).get(`/producers/${id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id,
      name: 'TestingProducer',
    });
  });
});
