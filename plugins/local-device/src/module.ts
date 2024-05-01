import { Module } from '@nestjs/common';
import { ActorIdentifier, SensorIdentifier } from '@overtheairbrew/plugins';
import { LocalDeviceDummyActor } from './actors/dummy';
import { LocalDevice } from './device';
import { LocalDeviceDummySensor } from './sensors/dummy';

const Actors = [LocalDeviceDummyActor];
const Sensors = [LocalDeviceDummySensor];

@Module({
  providers: [
    ...Actors,
    ...Sensors,
    {
      provide: ActorIdentifier,
      useFactory: (...actors) => actors,
      inject: Actors,
    },
    {
      provide: SensorIdentifier,
      useFactory: (...sensors) => sensors,
      inject: Sensors,
    },
    LocalDevice,
  ],
  exports: [LocalDevice],
})
export class LocalDeviceModule {}
