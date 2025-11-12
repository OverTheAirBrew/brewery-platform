import { Module } from '@nestjs/common';

import { ActorsService } from './actors.service';
import { ActorsController } from './actors.controller';
import { DataModule } from '../../data/data.module';
import { DeviceTypesModule } from '../device-types/device-types.module';
import { DevicesModule } from '../devices/device.module';
import { ActorSensorTypesModule } from '../actor-sensor-types/actor-sensor-types.module';

@Module({
  controllers: [ActorsController],
  providers: [ActorsService],
  imports: [
    DataModule,
    DeviceTypesModule,
    DevicesModule,
    ActorSensorTypesModule,
  ],
  exports: [ActorsService],
})
export class ActorsModule {}
