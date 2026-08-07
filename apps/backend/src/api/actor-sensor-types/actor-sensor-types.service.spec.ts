import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorSensorTypesService } from './actor-sensor-types.service';
import { Test } from '@nestjs/testing';
import { DeviceTypesService } from '../device-types/device-types.service';
import { SensorTypeNotFoundError } from './errors/sensor-type-not-found-error';
import { ActorTypeNotFoundError } from './errors/actor-type-not-found-error';

const mockDeviceTypesService = {
  getAll: vi.fn(),
  getByNameRaw: vi.fn(),
};

describe('ActorSensorTypesService', () => {
  let actorSensorTypesService: ActorSensorTypesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ActorSensorTypesService,
        {
          provide: DeviceTypesService,
          useValue: mockDeviceTypesService,
        },
      ],
    }).compile();

    actorSensorTypesService = module.get<ActorSensorTypesService>(
      ActorSensorTypesService,
    );
  });

  describe('getRawSensorType', () => {
    it('should return the sensor type with the given name', async () => {
      mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [
          {
            name: 'sensor1',
          },
        ],
      });

      const response = await actorSensorTypesService.getRawSensorType(
        'deviceTypeId',
        'sensor1',
      );

      expect(response).toMatchObject({
        name: 'sensor1',
      });
    });

    it('should throw an error if the sensor type is not found', async () => {
      mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [],
      });

      await expect(
        actorSensorTypesService.getRawSensorType('deviceTypeId', 'sensor1'),
      ).rejects.toBeInstanceOf(SensorTypeNotFoundError);
    });
  });

  describe('getRawActorType', () => {
    it('should return the actor type with the given name', async () => {
      mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        actors: [
          {
            name: 'actor1',
          },
        ],
      });

      const response = await actorSensorTypesService.getRawActorType(
        'deviceTypeId',
        'actor1',
      );

      expect(response).toMatchObject({
        name: 'actor1',
      });
    });

    it('should throw an error if the actor type is not found', async () => {
      mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        actors: [],
      });

      await expect(
        actorSensorTypesService.getRawActorType('deviceTypeId', 'actor1'),
      ).rejects.toBeInstanceOf(ActorTypeNotFoundError);
    });
  });
});
