import { Module } from '@nestjs/common';

import { ActorsService } from './actors.service';
import { ActorsController } from './actors.controller';
import { ActorTypesModule } from '../actor-types/actor-types.module';
import { DataModule } from '../../data/data.module';
import { DeviceTypesModule } from '../device-types/device-types.module';

@Module({
  controllers: [ActorsController],
  providers: [ActorsService],
  imports: [ActorTypesModule, DataModule, DeviceTypesModule],
  exports: [ActorsService],
})
export class ActorsModule {}
