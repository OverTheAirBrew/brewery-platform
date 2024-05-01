import { Module } from '@nestjs/common';
import { REPOSITORIES } from './data.abstractions';
import { databaseProvider } from './data.provider';
import { ApiKey } from './entities/api-key.entity';
import { Beverage } from './entities/beverage.entity';
import { Display } from './entities/display.entity';
import { Keg } from './entities/keg.entity';
import { Producer } from './entities/producer.entity';
import { Tap } from './entities/tap.entity';

const RepositoryEntries = Object.values(REPOSITORIES);

@Module({
  providers: [
    databaseProvider,
    {
      provide: REPOSITORIES.DisplayRepository,
      useValue: Display,
    },
    {
      provide: REPOSITORIES.BeverageRepository,
      useValue: Beverage,
    },
    {
      provide: REPOSITORIES.ProducerRepository,
      useValue: Producer,
    },
    {
      provide: REPOSITORIES.KegRepository,
      useValue: Keg,
    },
    {
      provide: REPOSITORIES.TapRepository,
      useValue: Tap,
    },
    {
      provide: REPOSITORIES.ApiKeyRepository,
      useValue: ApiKey,
    },
  ],
  exports: [databaseProvider, ...RepositoryEntries],
})
export class DataModule {}
