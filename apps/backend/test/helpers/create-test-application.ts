import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../src/auth/auth.guard';
import { REPOSITORIES } from '../../src/data/data.abstractions';
import { ApiKey } from '../../src/data/entities/api-key.entity';
import { Sensor } from '../../src/data/entities/sensor.entity';
import { Telemetry } from '../../src/data/entities/telemetry.entity';
import { Device } from '../../src/data/entities/device.entity';
import { Actor } from '../../src/data/entities/actor.entity';
import { Vessel } from '../../src/data/entities/vessel.entity';
import { inject } from 'vitest';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

class MockAuthGuard extends AuthGuard {
  async canActivate(): Promise<boolean> {
    return true;
  }
}

export interface IRepositories {
  apiKeys: typeof ApiKey;
  sensors: typeof Sensor;
  telemetries: typeof Telemetry;
  devices: typeof Device;
  actors: typeof Actor;
  vessels: typeof Vessel;
}

export const createTestApplication = async () => {
  const { AppModule } = await import('../../src/app.module');

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthGuard)
    .useClass(MockAuthGuard)
    // .overrideProvider(DeviceIdentifier)
    // .useValue([new TestingDevice()])
    // .overrideProvider(LogicIdentifier)
    // .useValue([new TestingLogic()])

    // .setLogger(new Logger())
    .compile();

  const app = moduleFixture.createNestApplication();

  const mqttUrl = new URL(inject('MQTT_URL'));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: `${mqttUrl.protocol}//${mqttUrl.hostname}`,
      port: parseInt(mqttUrl.port) || 1883,
      username: mqttUrl.username,
      password: mqttUrl.password,
    },
  });

  await app.startAllMicroservices();
  await app.init();

  const repositories = await getDatabases(moduleFixture);

  return { app, repositories };
};

export const getDatabases = async (module: TestingModule) => {
  const databases: IRepositories = {
    telemetries: module.get(REPOSITORIES.TelemetryRepository),
    apiKeys: module.get(REPOSITORIES.ApiKeyRepository),
    sensors: module.get(REPOSITORIES.SensorRepository),
    actors: module.get(REPOSITORIES.ActorRepository),
    devices: module.get(REPOSITORIES.DeviceRepository),
    vessels: module.get(REPOSITORIES.VesselRepository),
  };

  return databases;
};
