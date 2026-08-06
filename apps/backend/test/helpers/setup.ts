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
import { createConnection, Connection } from 'mysql2/promise';

export let app: INestApplication;
export let repositories: IRepositories;

let pool: Connection;
let databaseId: string;

beforeAll(async () => {
  vitest.stubEnv('MIGRATE', 'true');
  vitest.stubEnv('DATABASE_TYPE', 'mysql');
  vitest.stubEnv('PRIVATE_KEY', randomUUID());
  vitest.stubEnv('MQTT_URL', inject('MQTT_URL'));
});

beforeEach(async () => {
  databaseId = randomUUID();

  pool = await createConnection(inject('MYSQL_URL'));
  await pool.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseId}\`;`);

  vitest.stubEnv('MYSQL_URL', `${inject('MYSQL_URL')}/${databaseId}`);

  ({ app, repositories } = await createTestApplication());
});

afterEach(async () => {
  await pool.execute(`DROP DATABASE IF EXISTS \`${databaseId}\`;`);
  await pool.end();

  await app?.close();
});
