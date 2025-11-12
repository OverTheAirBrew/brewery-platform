import { Module } from '@nestjs/common';

import { DataModule } from '../../data/data.module';
import { DeviceTypesService } from '../device-types/device-types.service';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';

@Module({
  providers: [SensorsService, DeviceTypesService],
  controllers: [SensorsController],
  imports: [DataModule],
})
export class SensorsModule {}
