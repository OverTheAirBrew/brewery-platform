import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('BeveragesController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/beverages (POST)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    const response = await request(app.getHttpServer())
      .post('/beverages')
      .send({
        name: 'TestingBeverage',
        style: 'TestingStyle',
        abv: 12.11,
        description: 'TestingDescription',
        producer_id: id,
      });

    expect(response.status).toBe(201);

    const createdBeverage = await repositories.beverages.findByPk(
      response.body.id,
    );

    expect(createdBeverage).toBeDefined();
    expect(createdBeverage!).toMatchObject(
      expect.objectContaining({
        id: response.body.id,
        name: 'TestingBeverage',
        style: 'TestingStyle',
        abv: 12.11,
        description: 'TestingDescription',
        producer_id: id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('/beverages (GET)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12.11,
      description: 'TestingDescription',
      producer_id: id,
    });

    const response = await request(app.getHttpServer()).get('/beverages');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'TestingBeverage',
          style: 'TestingStyle',
          abv: 12.11,
          description: 'TestingDescription',
          producer_id: id,
        }),
      ]),
    );
  });

  it('/beverages/:id (GET)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12.11,
      description: 'TestingDescription',
      producer_id: id,
    });

    const response = await request(app.getHttpServer()).get(
      `/beverages/${beverageId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12.11,
      description: 'TestingDescription',
      producer_id: id,
    });
  });

  it('/beverages/:beverageId (PUT)', async () => {
    const { id } = await repositories.producers.create({
      name: 'TestingProducer',
    });

    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12.11,
      description: 'TestingDescription',
      producer_id: id,
    });

    const response = await request(app.getHttpServer())
      .put(`/beverages/${beverageId}`)
      .send({
        name: 'UpdatedTestingBeverage',
        style: 'UpdatedTestingStyle',
        abv: 11.12,
        description: 'UpdatedTestingDescription',
        producer_id: id,
      });

    expect(response.status).toBe(204);

    const updatedBeverage = await repositories.beverages.findByPk(beverageId);

    expect(updatedBeverage).toMatchObject({
      id: beverageId,
      name: 'UpdatedTestingBeverage',
      style: 'UpdatedTestingStyle',
      abv: 11.12,
      description: 'UpdatedTestingDescription',
      producer_id: id,
    });
  });
});
