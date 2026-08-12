import { Module } from '@nestjs/common';
import { FtssDevice } from './device';
import { ActorIdentifier, SensorIdentifier } from '@overtheairbrew/plugins';
import { FtssDeviceSensor } from './sensors';
import { MqttProcessor } from './controller';
import { FtssDeviceActor } from './actor';
import { MqttClientModule } from '../../mqtt-client/mqtt-client.module';
import { TelemetryModule } from '../../api/telemetry/telemetry.module';

const Actors: any = [FtssDeviceActor];
const Sensors: any = [FtssDeviceSensor];

@Module({
  providers: [
    ...Actors,
    ...Sensors,
    {
      provide: ActorIdentifier,
      useFactory: (...actors) => actors || [],
      inject: Actors,
    },
    {
      provide: SensorIdentifier,
      useFactory: (...sensors) => sensors || [],
      inject: Sensors,
    },
    FtssDevice,
  ],
  imports: [MqttClientModule, TelemetryModule],
  exports: [FtssDevice],
  controllers: [MqttProcessor],
})
export class FtssDeviceModule {}
