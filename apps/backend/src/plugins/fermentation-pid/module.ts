import { Module } from '@nestjs/common';
import { FermentationPid } from './logic';
import { LogicIdentifier } from '@overtheairbrew/plugins';
import { createCollectionProvider } from '../provider-helpers';

const Logics = [FermentationPid];

@Module({
  providers: [...Logics, createCollectionProvider(LogicIdentifier, Logics)],
  exports: [...Logics],
})
export class FermentationPidModule {}
