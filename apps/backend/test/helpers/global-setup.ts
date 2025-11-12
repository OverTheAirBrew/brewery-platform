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

let mysqlContainer: StartedMySqlContainer;
let mosquittoContainer: StartedMosquittoContainer;

export async function setup(project: TestProject) {
  const PASSWORD = randomUUID();
  const DATABASE = randomUUID();

  mysqlContainer = await new MySqlContainer('mysql:9.7.0')
    .withRootPassword(PASSWORD)
    .withDatabase(DATABASE)
    .start();

  mosquittoContainer = await new MosquittoContainer(
    'eclipse-mosquitto:2.0.15',
  ).start();

  project.provide(
    'MYSQL_URL',
    `mysql://root:${PASSWORD}@${mysqlContainer.getHost()}:${mysqlContainer.getPort()}/${DATABASE}`,
  );
  project.provide('MIGRATE', 'true');
  project.provide('DATABASE_TYPE', 'mysql');

  project.provide(
    'MQTT_URL',
    `mqtt://${mosquittoContainer.getHost()}:${mosquittoContainer.getMappedPort(1883)}`,
  );
}

export async function teardown() {
  await mysqlContainer?.stop();
  await mosquittoContainer?.stop();
}
