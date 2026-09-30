import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import {
  MosquittoContainer,
  StartedMosquittoContainer,
} from '@testcontainers/mosquitto';
import { randomUUID } from 'node:crypto';
import type { TestProject } from 'vitest/node';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import {
  MockserverContainer,
  StartedMockserverContainer,
} from '@testcontainers/mockserver';

declare module 'vitest' {
  export interface ProvidedContext {
    MQTT_URL: string;
    MYSQL_URL: string;
    REDIS_URL: string;
  }
}

let startedMysqlContainer: StartedMySqlContainer;
let startedMosquittoContainer: StartedMosquittoContainer;
let startedRedisContainer: StartedRedisContainer;
let startedMockserverContainer: StartedMockserverContainer;

export async function setup(project: TestProject) {
  const PASSWORD = randomUUID();

  const mysqlContainer = new MySqlContainer('mysql:9.7.0')
    .withRootPassword(PASSWORD)
    .withDatabase('DUMMY_DATABASE');

  const mosquittoContainer = new MosquittoContainer('eclipse-mosquitto:2.0.15');
  const redisContainer = new RedisContainer('redis:7.2.0');
  const mockserverContainer = new MockserverContainer(
    'mockserver/mockserver:5.15.0',
  );

  [
    startedMysqlContainer,
    startedMosquittoContainer,
    startedRedisContainer,
    startedMockserverContainer,
  ] = await Promise.all([
    mysqlContainer.start(),
    mosquittoContainer.start(),
    redisContainer.start(),
    mockserverContainer.start(),
  ]);

  project.provide(
    'MYSQL_URL',
    `mysql://root:${PASSWORD}@${startedMysqlContainer.getHost()}:${startedMysqlContainer.getPort()}`,
  );

  project.provide(
    'MQTT_URL',
    `mqtt://${startedMosquittoContainer.getHost()}:${startedMosquittoContainer.getMappedPort(1883)}`,
  );

  project.provide(
    'REDIS_URL',
    `redis://${startedRedisContainer.getHost()}:${startedRedisContainer.getMappedPort(6379)}`,
  );
}

export async function teardown() {
  await startedMysqlContainer?.stop();
  await startedMosquittoContainer?.stop();
  await startedRedisContainer?.stop();
  await startedMockserverContainer?.stop();
}
