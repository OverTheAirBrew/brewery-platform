import { Test, TestingModule } from '@nestjs/testing';
import { DeviceIdentifier } from '@overtheairbrew/plugins';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/auth/auth.guard';
import { REPOSITORIES } from '../../src/data/data.abstractions';
import { ApiKey } from '../../src/data/entities/api-key.entity';
import { Beverage } from '../../src/data/entities/beverage.entity';
import { Display } from '../../src/data/entities/display.entity';
import { Keg } from '../../src/data/entities/keg.entity';
import { Producer } from '../../src/data/entities/producer.entity';
import { Tap } from '../../src/data/entities/tap.entity';
import { TestingDevice } from './test-providers/device';

class MockAuthGuard extends AuthGuard {
  async canActivate(): Promise<boolean> {
    return true;
  }
}

export interface IRepositories {
  displays: typeof Display;
  apiKeys: typeof ApiKey;
  beverages: typeof Beverage;
  producers: typeof Producer;
  kegs: typeof Keg;
  taps: typeof Tap;
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
    displays: module.get(REPOSITORIES.DisplayRepository),
    beverages: module.get(REPOSITORIES.BeverageRepository),
    producers: module.get(REPOSITORIES.ProducerRepository),
    kegs: module.get(REPOSITORIES.KegRepository),
    taps: module.get(REPOSITORIES.TapRepository),
  };

  try {
    await databases.apiKeys.destroy({ where: {} });
    await databases.displays.destroy({ where: {} });
    await databases.taps.destroy({ where: {} });
    await databases.kegs.destroy({ where: {} });
    await databases.beverages.destroy({ where: {} });
    await databases.producers.destroy({ where: {} });
  } catch (err) {
    console.log(err);
  }

  return databases;
};
