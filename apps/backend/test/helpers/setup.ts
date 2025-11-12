import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  inject,
  vitest,
} from 'vitest';
import { randomUUID } from 'crypto';
import {
  createTestApplication,
  IRepositories,
} from './create-test-application';
import { INestApplication } from '@nestjs/common';

export let app: INestApplication;
export let repositories: IRepositories;

beforeAll(async () => {
  vitest.stubEnv('MYSQL_URL', inject('MYSQL_URL'));
  vitest.stubEnv('MQTT_URL', inject('MQTT_URL'));
  vitest.stubEnv('MIGRATE', 'true');
  vitest.stubEnv('DATABASE_TYPE', inject('DATABASE_TYPE'));

  vitest.stubEnv('PRIVATE_KEY', randomUUID());

  ({ app, repositories } = await createTestApplication());
});

afterAll(async () => {
  await app?.close();
});

afterEach(async () => {
  try {
    await repositories.apiKeys.destroy({ where: {} });
  } catch (err) {
    console.log(err);
  }
});
