import { Test, TestingModule } from '@nestjs/testing';
import { DeviceIdentifier, LogicIdentifier } from '@overtheairbrew/plugins';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/auth/auth.guard';
import { REPOSITORIES } from '../../src/data/data.abstractions';
import { ApiKey } from '../../src/data/entities/api-key.entity';
import { TestingDevice } from './test-providers/device';
import { Sensor } from '../../src/data/entities/sensor.entity';
import { Telemetry } from '../../src/data/entities/telemetry.entity';
import { Device } from '../../src/data/entities/device.entity';
import { Actor } from '../../src/data/entities/actor.entity';
import { TestingLogic } from './test-providers/logic';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../src/config';
import { Vessel } from '../../src/data/entities/vessel.entity';

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
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthGuard)
    .useClass(MockAuthGuard)
    .overrideProvider(DeviceIdentifier)
    .useValue([new TestingDevice()])
    .overrideProvider(LogicIdentifier)
    .useValue([new TestingLogic()])

    // .setLogger(new Logger())
    .compile();

  const app = moduleFixture.createNestApplication();
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
