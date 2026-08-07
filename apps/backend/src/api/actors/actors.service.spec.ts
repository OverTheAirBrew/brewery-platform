import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorsService } from './actors.service';
import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../../data/data.abstractions';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';
import { DeviceTypesService } from '../device-types/device-types.service';

class MockRepository {
  findAll = vi.fn();
  findByPk = vi.fn();
  create = vi.fn().mockResolvedValue({ id: 1 });
}

class MockDeviceRepository extends MockRepository {}

class ActorSensorTypesServiceMock {
  getRawActorType = vi.fn();
  validateConfiguration = vi.fn();
}
class DeviceTypesServiceMock {
  getByNameRaw = vi.fn();
}

describe('ActorsService', () => {
  let actorsService: ActorsService;

  let deviceRepositoryMock: MockDeviceRepository;
  let actorRepositoryMock: MockRepository;
  let actorSensorTypesServiceMock: ActorSensorTypesServiceMock;
  let deviceTypesServiceMock: DeviceTypesServiceMock;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: REPOSITORIES.DeviceRepository,
          useClass: MockDeviceRepository,
        },
        {
          provide: REPOSITORIES.ActorRepository,
          useClass: MockRepository,
        },
        {
          provide: ActorSensorTypesService,
          useClass: ActorSensorTypesServiceMock,
        },
        {
          provide: DeviceTypesService,
          useClass: DeviceTypesServiceMock,
        },
      ],
    }).compile();

    actorsService = module.get<ActorsService>(ActorsService);
    deviceRepositoryMock = module.get<MockDeviceRepository>(
      REPOSITORIES.DeviceRepository,
    );
    actorRepositoryMock = module.get<MockRepository>(
      REPOSITORIES.ActorRepository,
    );
    actorSensorTypesServiceMock = module.get<ActorSensorTypesServiceMock>(
      ActorSensorTypesService,
    );
    deviceTypesServiceMock =
      module.get<DeviceTypesServiceMock>(DeviceTypesService);
  });

  describe('createActor', () => {
    it('test', async () => {
      deviceRepositoryMock.findByPk.mockResolvedValue({});

      deviceTypesServiceMock.getByNameRaw.mockResolvedValue({
        validateActorCount: vi.fn().mockReturnValue(false),
      });

      actorSensorTypesServiceMock.getRawActorType.mockResolvedValue({
        validateConfiguration: vi.fn().mockResolvedValue(true),
      });

      const { id } = await actorsService.createActor({} as any);

      expect(id).toBe(1);
    });
  });
});
