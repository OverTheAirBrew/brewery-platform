import { Test, TestingModule } from '@nestjs/testing';
import { DeviceIdentifier } from '@overtheairbrew/plugins';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/auth/auth.guard';
import { REPOSITORIES } from '../../src/data/data.abstractions';
import { ApiKey } from '../../src/data/entities/api-key.entity';
import { TestingDevice } from './test-providers/device';

class MockAuthGuard extends AuthGuard {
  async canActivate(): Promise<boolean> {
    return true;
  }
}

export interface IRepositories {
  apiKeys: typeof ApiKey;
}

export const createTestApplication = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthGuard)
    .useClass(MockAuthGuard)
    .overrideProvider(DeviceIdentifier)
    .useValue([new TestingDevice()])
    // .setLogger(new Logger())
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const repositories = await getDatabases(moduleFixture);

  return { app, repositories };
};

export const getDatabases = async (module: TestingModule) => {
  const databases: IRepositories = {
    apiKeys: module.get(REPOSITORIES.ApiKeyRepository),
  };

  return databases;
};
