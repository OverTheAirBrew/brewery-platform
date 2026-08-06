import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DeviceTypesService } from '../device-types/device-types.service';
import { DeviceDto, SensorTypeSchema } from '@overtheairbrew/models';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Device } from '../../data/entities/device.entity';
import { Actor, RequiredCredentials, Sensor } from '@overtheairbrew/plugins';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { AddMqttUserMessage } from '../../mqtt-client/events/add-mqtt-user.message';
import { randomFillSync } from 'crypto';

@Injectable()
export class DeviceService {
  constructor(
    private deviceTypeService: DeviceTypesService,
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    private readonly mqttClient: MqttService,
  ) {}

  private generatePassword(
    length = 20,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$',
  ): string {
    return Array.from(randomFillSync(new Uint32Array(length)))
      .map((x) => characters[x % characters.length])
      .join('');
  }

  async createDevice(deviceDto: DeviceDto) {
    const deviceType = await this.deviceTypeService.getByNameRaw(
      deviceDto.type,
    );

    if (!deviceType) {
      throw new BadRequestException(`Device type ${deviceDto.type} not found`);
    }

    await deviceType.validateConfiguration(deviceDto.config);

    const device = await this.deviceRepository.create({
      ...deviceDto,
      type: deviceType.name,
    });

    const mqttPassword = this.generatePassword();
    if (deviceType.requiredCredentials === RequiredCredentials.MQTT) {
      this.mqttClient.sendMessage(
        new AddMqttUserMessage({
          username: device.id,
          password: mqttPassword,
          authorizeSubscribe: [`ftss/${device.id}/actor/command`],
        }),
      );
    }

    return {
      id: device.id,
      password: mqttPassword,
    };
  }

  async getByIds(ids: string[]) {
    const devices = await this.deviceRepository.findAll({
      where: {
        id: ids,
      },
    });

    return devices;
  }

  async getSensorTypesForDeviceId(id: string) {
    const device = await this.deviceRepository.findByPk(id);

    if (!device) {
      throw new BadRequestException(`Device with id ${id} not found`);
    }

    const deviceType = await this.deviceTypeService.getByNameRaw(device.type);

    if (!deviceType) {
      throw new BadRequestException(
        `Device type ${device.type} not found for device ${id}`,
      );
    }

    return await Promise.all(
      deviceType.sensors.map((sensor) =>
        this.mapSensorType(sensor, device.config),
      ),
    );
  }

  async getActorTypesForDeviceId(id: string) {
    const device = await this.deviceRepository.findByPk(id);

    if (!device) {
      throw new BadRequestException(`Device with id ${id} not found`);
    }

    const deviceType = await this.deviceTypeService.getByNameRaw(device.type);

    if (!deviceType) {
      throw new BadRequestException(
        `Device type ${device.type} not found for device ${id}`,
      );
    }

    return await Promise.all(
      deviceType.actors.map((actor) => this.mapActorType(actor, device.config)),
    );
  }

  private async mapActorType(
    actor: Actor<unknown, unknown>,
    deviceConfig: unknown,
  ) {
    const properties = await actor.getConfigOptions(deviceConfig);

    return SensorTypeSchema.parse({
      name: actor.name,
      properties,
    });
  }

  private async mapSensorType(
    sensor: Sensor<unknown, unknown>,
    deviceConfig: unknown,
  ) {
    const properties = await sensor.getConfigOptions(deviceConfig);

    return SensorTypeSchema.parse({
      name: sensor.name,
      properties,
    });
  }
}
