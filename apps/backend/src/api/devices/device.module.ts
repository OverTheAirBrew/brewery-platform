import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DevicesController } from './device.controller';
import { DataModule } from '../../data/data.module';
import { DeviceTypesService } from '../device-types/device-types.service';

@Module({
  providers: [DeviceService, DeviceTypesService],
  controllers: [DevicesController],
  imports: [DataModule],
})
export class DevicesModule {}
