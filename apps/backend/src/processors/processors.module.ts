import { Module } from '@nestjs/common';

import { MqttSensorBootstrapper } from './mqtt-sensor.bootstrapper';
import { SensorsService } from '../api/sensors/sensors.service';
import { DataModule } from '../data/data.module';
import { DeviceTypesService } from '../api/device-types/device-types.service';
import { DeviceService } from '../api/devices/device.service';

@Module({
  providers: [
    SensorsService,
    MqttSensorBootstrapper,
    DeviceTypesService,
    DeviceService,
  ],
  imports: [DataModule],
})
export class ProcessorsModule {}
