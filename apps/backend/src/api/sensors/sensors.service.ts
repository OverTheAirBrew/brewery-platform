import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Device } from '../../data/entities/device.entity';
import { SensorDto } from '@overtheairbrew/models';
import { DeviceTypesService } from '../device-types/device-types.service';
import { Sensor } from '../../data/entities/sensor.entity';
import { RequiredCredentials } from '@overtheairbrew/plugins';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { UpdateAuthorizePublishSubscribe } from '../../mqtt-client/events/update-mqtt-user-authorize-publish-subscribe';

/* istanbul ignore start */
@Injectable()
export class SensorsService {
  /* istanbul ignore stop */
  constructor(
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    @Inject(REPOSITORIES.SensorRepository)
    private readonly sensorRepository: typeof Sensor,
    private readonly deviceTypesService: DeviceTypesService,
    private readonly mqttClient: MqttService,
  ) {}

  async createSensor(sensorDto: SensorDto) {
    const device = await this.deviceRepository.findByPk(sensorDto.device_id, {
      attributes: ['id', 'type'],
      include: [
        {
          model: Sensor,
          as: 'sensors',
          attributes: ['id'],
        },
      ],
    });

    if (!device) {
      throw new BadRequestException(
        `Device with ID ${sensorDto.device_id} not found`,
      );
    }

    const deviceType = await this.deviceTypesService.getByNameRaw(device.type);

    if (!deviceType) {
      throw new BadRequestException(`Device type ${device.type} not found`);
    }

    const sensorType = deviceType.sensors.find(
      (s) => s.name === sensorDto.type,
    );

    if (!sensorType) {
      throw new BadRequestException(
        `Sensor type ${sensorDto.type} not found for device type ${device.type}`,
      );
    }

    if (deviceType.validateSensorCount(device.sensors?.length || 0)) {
      throw new BadRequestException(
        `Maximum number of sensors exceeded for device type ${device.type}`,
      );
    }

    await sensorType.validateConfiguration(device.config, sensorDto.config);

    const { id } = await this.sensorRepository.create(sensorDto);

    if (deviceType.requiredCredentials === RequiredCredentials.MQTT) {
      this.mqttClient.sendMessage(
        new UpdateAuthorizePublishSubscribe({
          username: device.id,
          authorizePublish: [`ftss/${device.id}/sensor/${id}/reading`],
        }),
      );
    }

    return { id };
  }

  async getAll() {
    const sensors = await this.sensorRepository.findAll();
    return sensors;
  }

  async getSensorsWithDeviceInfo() {
    const sensors = await this.sensorRepository.findAll({
      where: {
        type: ['LocalDeviceDummySensor'],
      },
      include: [
        {
          model: Device,
          attributes: ['id', 'config'],
        },
      ],
      attributes: ['id', 'type', 'config'],
    });

    return sensors.map((sensor) => ({
      id: sensor.id,
      type: sensor.type,
      config: sensor.config,
      device: {
        id: sensor.device!.id,
        config: sensor.device!.config,
      },
    }));
  }
}
