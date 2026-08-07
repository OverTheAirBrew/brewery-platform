import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorsService } from './actors.service';
import { REPOSITORIES } from '../../data/data.abstractions';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';
import { DeviceTypesService } from '../device-types/device-types.service';
import { Mocked, TestBed } from '@suites/unit';
import { Device } from '../../data/entities/device.entity';
import { Actor } from '../../data/entities/actor.entity';
import { TestingDevice } from '../../../test/helpers/test-providers/device';
import { TestingActor } from '../../../test/helpers/test-providers/actor';

describe('ActorsService', () => {
  let actorsService: ActorsService;

  let mockDeviceRepository: Mocked<typeof Device>;
  let mockActorRepository: Mocked<typeof Actor>;
  let mockActorSensorTypesService: Mocked<ActorSensorTypesService>;
  let mockDeviceTypesService: Mocked<DeviceTypesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(ActorsService).compile();

    actorsService = unit;

    mockDeviceRepository = unitRef.get<typeof Device>(
      REPOSITORIES.DeviceRepository,
    );
    mockActorRepository = unitRef.get<typeof Actor>(
      REPOSITORIES.ActorRepository,
    );
    mockActorSensorTypesService = unitRef.get<ActorSensorTypesService>(
      ActorSensorTypesService,
    );
    mockDeviceTypesService =
      unitRef.get<DeviceTypesService>(DeviceTypesService);
  });

  describe('createActor', () => {
    it('test', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({} as any);

      void mockActorRepository.create.mockResolvedValue({ id: 1 });

      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(
        new TestingDevice(),
      );

      void mockActorSensorTypesService.getRawActorType.mockResolvedValue(
        new TestingActor(),
      );

      const { id } = await actorsService.createActor({} as any);

      expect(id).toBe(1);
    });
  });
});
