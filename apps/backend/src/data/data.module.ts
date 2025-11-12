import { Module } from '@nestjs/common';
import { REPOSITORY_ENTITIES } from './data.abstractions';
import { databaseProvider } from './data.provider';

@Module({
  providers: [databaseProvider, ...REPOSITORY_ENTITIES],
  exports: [
    databaseProvider,
    ...REPOSITORY_ENTITIES.map((entry) => entry.provide),
  ],
})
export class DataModule {}
