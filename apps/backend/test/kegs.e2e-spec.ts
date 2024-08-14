import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('KegsController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/kegs (POST)', async () => {
    const { id: producerId } = await repositories.producers.create({
      name: 'TestingProducer',
    });
    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12,
      description: 'TestingDescription',
      producer_id: producerId,
    });

    const response = await request(app.getHttpServer()).post('/kegs').send({
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
    });

    expect(response.status).toBe(201);

    const createdKeg = await repositories.kegs.findByPk(response.body.id);

    expect(createdKeg).toBeDefined();
    expect(createdKeg!.toJSON()).toMatchObject({
      id: response.body.id,
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('/kegs (GET)', async () => {
    const { id: producerId } = await repositories.producers.create({
      name: 'TestingProducer',
    });
    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12,
      description: 'TestingDescription',
      producer_id: producerId,
    });
    await repositories.kegs.create({
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
    });

    const response = await request(app.getHttpServer()).get('/kegs');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
    });
  });

  it('/kegs/:id (GET)', async () => {
    const { id: producerId } = await repositories.producers.create({
      name: 'TestingProducer',
    });
    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12,
      description: 'TestingDescription',
      producer_id: producerId,
    });
    const { id: kegId } = await repositories.kegs.create({
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
    });

    const response = await request(app.getHttpServer()).get(`/kegs/${kegId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      beverage_id: beverageId,
      type: 'KEG',
      status: 'IN_STOCK',
    });
  });
});
