import { Module } from '@nestjs/common';
import { FermentationPid } from './logic';
import { LogicIdentifier } from '@overtheairbrew/plugins';

const Logics: any[] = [FermentationPid];

@Module({
  providers: [
    ...Logics,
    {
      provide: LogicIdentifier,
      useFactory: (...logics) => logics || [],
      inject: [...Logics],
    },
  ],
  exports: [...Logics],
})
export class FermentationPidModule {}
