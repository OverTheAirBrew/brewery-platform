import { Module } from '@nestjs/common';
import { ActorIdentifier, SensorIdentifier } from '@overtheairbrew/plugins';
import { LocalDeviceDummyActor } from './actors/dummy';
import { LocalDevice } from './device';
import { LocalDeviceDummySensor } from './sensors/dummy';
import { LocalDeviceController } from './controller';
import { DataModule } from '../../data/data.module';
import { SensorsService } from '../../api/sensors/sensors.service';
import { DeviceTypesService } from '../../api/device-types/device-types.service';
import { createCollectionProvider } from '../provider-helpers';

const Actors = [LocalDeviceDummyActor];
const Sensors = [LocalDeviceDummySensor];

@Module({
  providers: [
    ...Actors,
    ...Sensors,
    createCollectionProvider(ActorIdentifier, Actors),
    createCollectionProvider(SensorIdentifier, Sensors),
    LocalDevice,
    SensorsService,
    DeviceTypesService,
  ],
  imports: [DataModule],
  exports: [LocalDevice],
  controllers: [LocalDeviceController],
})
export class LocalDeviceModule {}
