import { Injectable } from '@nestjs/common';
import { DeviceTypesService } from '../device-types/device-types.service';
import { SensorTypeNotFoundError } from './errors/sensor-type-not-found-error';
import { ActorTypeNotFoundError } from './errors/actor-type-not-found-error';

@Injectable()
export class ActorSensorTypesService {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}

  async getRawSensorType(deviceTypeId: string, sensorTypeId: string) {
    const deviceType = await this.deviceTypesService.getByNameRaw(deviceTypeId);

    const sensorType = deviceType.sensors.find(
      (sensor) => sensor.name === sensorTypeId,
    );

    if (!sensorType) {
      throw new SensorTypeNotFoundError(deviceTypeId, sensorTypeId);
    }

    return sensorType;
  }

  async getRawActorType(deviceTypeId: string, actorTypeId: string) {
    const deviceType = await this.deviceTypesService.getByNameRaw(deviceTypeId);

    const actorType = deviceType.actors.find(
      (actor) => actor.name === actorTypeId,
    );

    if (!actorType) {
      throw new ActorTypeNotFoundError(deviceTypeId, actorTypeId);
    }

    return actorType;
  }
}
