import { Module } from '@nestjs/common';
import { REPOSITORIES } from './data.abstractions';
import { databaseProvider } from './data.provider';
import { Beverage } from './entities/beverage.entity';
import { DisplayLogin } from './entities/display-logins';
import { Display } from './entities/display.entity';
import { Image } from './entities/image.entity';
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
      provide: REPOSITORIES.ImageRepository,
      useValue: Image,
    },
    {
      provide: REPOSITORIES.DeviceLoginsRepository,
      useValue: DisplayLogin,
    },
  ],
  exports: [databaseProvider, ...RepositoryEntries],
})
export class DataModule {}
