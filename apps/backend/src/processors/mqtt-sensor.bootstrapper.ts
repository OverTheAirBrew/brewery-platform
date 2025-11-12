import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SensorsService } from '../api/sensors/sensors.service';
import { DeviceTypesService } from '../api/device-types/device-types.service';
import { DeviceService } from '../api/devices/device.service';

@Injectable()
export class MqttSensorBootstrapper implements OnApplicationBootstrap {
  constructor(
    private readonly sensorService: SensorsService,
    private readonly deviceService: DeviceService,
    private readonly deviceTypesService: DeviceTypesService,
  ) {}

  async onApplicationBootstrap() {
    const sensors = await this.sensorService.getAll();
    const devices_ids = [...new Set(sensors.map((s) => s.device_id))];

    const devices = await this.deviceService.getByIds(devices_ids);

    for (const sensor of sensors) {
      const device = devices.find((d) => d.id === sensor.device_id);
      if (!device) {
        console.error(
          `Device with ID ${sensor.device_id} not found for sensor ${sensor.id}`,
        );
        continue;
      }

      const deviceType = await this.deviceTypesService.getByNameRaw(
        device.type,
      );

      if (!deviceType) {
        console.error(
          `Device type ${device.type} not found for sensor ${sensor.id}`,
        );
        continue;
      }

      const sensorType = deviceType.sensors.find((s) => s.name === sensor.type);

      if (!sensorType || sensorType.type !== 'mqtt') {
        continue;
      }
    }
  }
}
