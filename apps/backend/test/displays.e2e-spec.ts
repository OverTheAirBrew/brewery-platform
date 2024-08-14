import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApplication,
  IRepositories,
} from './helpers/create-test-application';

describe('DisplaysController (e2e)', () => {
  let app: INestApplication;
  let repositories: IRepositories;

  beforeEach(async () => {
    ({ app, repositories } = await createTestApplication());
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('/displays (GET)', async () => {
    const { id: createdDisplayId } = await repositories.displays.create({
      deviceCode: '12345',
      name: 'testing-device',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app.getHttpServer()).get('/displays');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject([
      {
        deviceCode: '12345',
        id: createdDisplayId,
        name: 'testing-device',
      },
    ]);
  });

  it('/displays (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/displays').send({
      deviceCode: '54321',
      name: 'another-device',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
    });

    const displays = await repositories.displays.findAll({});

    expect(displays).toHaveLength(1);
  });

  it('/displays/:deviceCode/tap-information (GET)', async () => {
    const { id: producerId } = await repositories.producers.create({
      name: 'TestingProducer',
    });
    const { id: beverageId } = await repositories.beverages.create({
      name: 'TestingBeverage',
      style: 'TestingStyle',
      abv: 12.11,
      description: 'TestingDescription',
      producer_id: producerId,
    });
    const { id: kegId } = await repositories.kegs.create({
      beverage_id: beverageId,
      status: 'IN_STOCK',
      type: 'CORNY',
    });
    const { id: tapId } = await repositories.taps.create({
      keg_id: kegId,
      name: 'TestingTap',
    });
    const { deviceCode } = await repositories.displays.create({
      deviceCode: '54321',
      name: 'another-device',
      tap_id: tapId,
    });

    const response = await request(app.getHttpServer())
      .get(`/displays/${deviceCode}/tap-information`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      beverage: {
        abv: 12.11,
        description: 'TestingDescription',
        id: beverageId,
        name: 'TestingBeverage',
        producer: 'TestingProducer',
        style: 'TestingStyle',
      },
      status: 'COMPLETE',
    });
  });
});
