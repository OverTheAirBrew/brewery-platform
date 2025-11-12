import { Controller, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Sensor } from '../../data/entities/sensor.entity';
import { Sensor as PluginSensor } from '@overtheairbrew/plugins';
import { Device } from '../../data/entities/device.entity';
import { SensorIdentifier } from '@overtheairbrew/plugins';
import { ILocalDeviceConfig } from './interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SensorsService } from '../../api/sensors/sensors.service';
import { SensorReading } from '../../internal-events/events/sensor-reading';

@Controller()
export class LocalDeviceController {
  constructor(
    private readonly sensorsService: SensorsService,
    @Inject(SensorIdentifier)
    private readonly pluginSensors: PluginSensor<ILocalDeviceConfig, any>[],
    // private readonly eventService: InternalEventsService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS, {
    waitForCompletion: true,
  })
  async handleCron() {
    const sensors = await this.sensorsService.getSensorsWithDeviceInfo();

    for (const sensor of sensors) {
      const sensorInstance = this.pluginSensors.find(
        (s) => s.constructor.name === sensor.type,
      );

      const value = await sensorInstance!.run({
        device: sensor.device.config,
        sensor: sensor.config,
      });

      if (!value) continue;

      // await this.eventService.sendMessage(
      //   new SensorReading({
      //     device_id: sensor.device!.id,
      //     sensor_id: sensor.id,
      //     value,
      //   }),
      // );
    }
  }
}
