import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ActorSensorTypesService } from './actor-sensor-types.service';

import { DeviceTypesService } from '../device-types/device-types.service';
import { SensorTypeNotFoundError } from './errors/sensor-type-not-found-error';
import { ActorTypeNotFoundError } from './errors/actor-type-not-found-error';
import { TestBed, Mocked } from '@suites/unit';

import { TestingDevice } from '../../../test/helpers/test-providers/device';

describe('ActorSensorTypesService', () => {
  let actorSensorTypesService: ActorSensorTypesService;
  let mockDeviceTypesService: Mocked<DeviceTypesService>;

  let testDevice: TestingDevice;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      ActorSensorTypesService,
    ).compile();

    mockDeviceTypesService =
      unitRef.get<DeviceTypesService>(DeviceTypesService);

    actorSensorTypesService = unit;

    testDevice = new TestingDevice();
  });

  describe('getRawSensorType', () => {
    it('should return the sensor type with the given name', async () => {
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(testDevice);

      const response = await actorSensorTypesService.getRawSensorType(
        'deviceTypeId',
        'TestingSensor',
      );

      expect(response).toMatchObject({
        name: 'TestingSensor',
      });
    });

    it('should throw an error if the sensor type is not found', async () => {
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(testDevice);

      await expect(
        actorSensorTypesService.getRawSensorType('deviceTypeId', 'unknown'),
      ).rejects.toBeInstanceOf(SensorTypeNotFoundError);
    });
  });

  describe('getRawActorType', () => {
    it('should return the actor type with the given name', async () => {
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(testDevice);

      const response = await actorSensorTypesService.getRawActorType(
        'deviceTypeId',
        'TestingActor',
      );

      expect(response).toMatchObject({
        name: 'TestingActor',
      });
    });

    it('should throw an error if the actor type is not found', async () => {
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(testDevice);

      await expect(
        actorSensorTypesService.getRawActorType('deviceTypeId', 'unknown'),
      ).rejects.toBeInstanceOf(ActorTypeNotFoundError);
    });
  });
});
