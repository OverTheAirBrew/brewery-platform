import { Module } from '@nestjs/common';
import { DeviceTypesService } from './device-types.service';
import { DeviceTypesController } from './device-types.controller';

@Module({
  providers: [DeviceTypesService],
  controllers: [DeviceTypesController],
})
export class DeviceTypesModule {}
