import { Module } from '@nestjs/common';
import { VesselsController } from './vessels.controller';
import { VesselsService } from './vessels.service';
import { LogicTypesModule } from '../logic-types/logic-types.module';
import { DataModule } from '../../data/data.module';
import { ActorsModule } from '../actors/actors.module';
import { ActorTypesModule } from '../actor-types/actor-types.module';
import { BullModule } from '@nestjs/bullmq';
import { LogicProcessingConsumer } from './vessel-logic.processor';
import { InternalEventsModule } from '../../internal-events/internal-events.module';
import { CustomQueue } from '../../internal-events/internal-events.service';
import { ConfigService } from '@nestjs/config';

const QUEUE_NAME = 'logic-processing-queue';

@Module({
  controllers: [VesselsController],
  providers: [VesselsService, LogicProcessingConsumer],
  imports: [
    LogicTypesModule,
    DataModule,
    ActorsModule,
    ActorTypesModule,
    InternalEventsModule.register(QUEUE_NAME),
  ],
  exports: [VesselsService],
})
export class VesselsModule {}
