import { Module } from '@nestjs/common';
import { ActorTypesService } from './actor-types.service';
import { ActorTypesController } from './actor-types.controller';
import { DataModule } from '../../data/data.module';
import { DeviceTypesService } from '../device-types/device-types.service';

@Module({
  providers: [ActorTypesService, DeviceTypesService],
  controllers: [ActorTypesController],
  imports: [DataModule],
  exports: [ActorTypesService],
})
export class ActorTypesModule {}
