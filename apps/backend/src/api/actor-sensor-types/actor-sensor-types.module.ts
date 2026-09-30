import { Module } from '@nestjs/common';
import { ActorSensorTypesService } from './actor-sensor-types.service';
import { DeviceTypesModule } from '../device-types/device-types.module';

@Module({
  providers: [ActorSensorTypesService],
  imports: [DeviceTypesModule],
  exports: [ActorSensorTypesService],
})
export class ActorSensorTypesModule {}
