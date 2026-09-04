import { Module } from '@nestjs/common';
import { FtssDevice } from './device';
import { ActorIdentifier, SensorIdentifier } from '@overtheairbrew/plugins';
import { FtssDeviceSensor } from './sensors';
import { MqttProcessor } from './controller';
import { FtssDeviceActor } from './actor';
import { MqttClientModule } from '../../mqtt-client/mqtt-client.module';
import { TelemetryModule } from '../../api/telemetry/telemetry.module';
import { createCollectionProvider } from '../provider-helpers';

const Actors = [FtssDeviceActor];
const Sensors = [FtssDeviceSensor];

@Module({
  providers: [
    ...Actors,
    ...Sensors,
    createCollectionProvider(ActorIdentifier, Actors),
    createCollectionProvider(SensorIdentifier, Sensors),
    FtssDevice,
  ],
  imports: [MqttClientModule, TelemetryModule],
  exports: [FtssDevice],
  controllers: [MqttProcessor],
})
export class FtssDeviceModule {}
