import { Module } from '@nestjs/common';
import { REPOSITORIES } from './data.abstractions';
import { databaseProvider } from './data.provider';
import { Display } from './entities/display.entity';

const RepositoryEntries = Object.entries(REPOSITORIES).map(
  ([_, value]) => value,
);

@Module({
  providers: [
    databaseProvider,
    {
      provide: REPOSITORIES.DisplayRepository,
      useValue: Display,
    },
  ],
  exports: [databaseProvider, ...RepositoryEntries],
})
export class DataModule {}
