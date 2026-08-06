import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import {
  MosquittoContainer,
  StartedMosquittoContainer,
} from '@testcontainers/mosquitto';
import { randomUUID } from 'node:crypto';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    MIGRATE: string;

    DATABASE_TYPE: string;
    MQTT_URL: string;
    MYSQL_URL: string;
  }
}

let startedMysqlContainer: StartedMySqlContainer;
let startedMosquittoContainer: StartedMosquittoContainer;

export async function setup(project: TestProject) {
  const PASSWORD = randomUUID();

  const mysqlContainer = new MySqlContainer('mysql:9.7.0')
    .withRootPassword(PASSWORD)
    .withDatabase('DUMMY_DATABASE');

  const mosquittoContainer = new MosquittoContainer('eclipse-mosquitto:2.0.15');

  [startedMysqlContainer, startedMosquittoContainer] = await Promise.all([
    mysqlContainer.start(),
    mosquittoContainer.start(),
  ]);

  project.provide(
    'MYSQL_URL',
    `mysql://root:${PASSWORD}@${startedMysqlContainer.getHost()}:${startedMysqlContainer.getPort()}`,
  );

  project.provide(
    'MQTT_URL',
    `mqtt://${startedMosquittoContainer.getHost()}:${startedMosquittoContainer.getMappedPort(1883)}`,
  );
}

export async function teardown() {
  await startedMysqlContainer?.stop();
  await startedMosquittoContainer?.stop();
}
