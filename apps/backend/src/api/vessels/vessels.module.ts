import { Module } from '@nestjs/common';
import { VesselsController } from './vessels.controller';
import { VesselsService } from './vessels.service';
import { LogicTypesModule } from '../logic-types/logic-types.module';
import { DataModule } from '../../data/data.module';
import { ActorsModule } from '../actors/actors.module';
import { LogicProcessingConsumer } from './vessel-logic.processor';
import { InternalEventsModule } from '../../internal-events/internal-events.module';
import { DevicesModule } from '../devices/device.module';
import { ActorSensorTypesModule } from '../actor-sensor-types/actor-sensor-types.module';

const QUEUE_NAME = 'logic-processing-queue';

@Module({
  controllers: [VesselsController],
  providers: [VesselsService, LogicProcessingConsumer],
  imports: [
    LogicTypesModule,
    DataModule,
    ActorsModule,
    DevicesModule,
    InternalEventsModule.register(QUEUE_NAME),
    ActorSensorTypesModule,
  ],
  exports: [VesselsService],
})
export class VesselsModule {}
