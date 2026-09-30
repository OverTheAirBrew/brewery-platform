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
import { DeviceNotFoundError } from '../devices/errors/device-not-found-error';
import { max } from 'rxjs';
import { MaximumActorsForDeviceError } from './errors/maximum-actors-for-device-error';
import { CommunicationType, MqttActor } from '@overtheairbrew/plugins';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { UpdateAuthorizePublishSubscribe } from '../../mqtt-client/events/update-mqtt-user-authorize-publish-subscribe';

describe('ActorsService', () => {
  let actorsService: ActorsService;

  let mockDeviceRepository: Mocked<typeof Device>;
  let mockActorRepository: Mocked<typeof Actor>;
  let mockActorSensorTypesService: Mocked<ActorSensorTypesService>;
  let mockDeviceTypesService: Mocked<DeviceTypesService>;
  let mockMqttService: Mocked<MqttService>;

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

    mockMqttService = unitRef.get<MqttService>(MqttService);
  });

  describe('createActor', () => {
    it('should create an actor', async () => {
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

    it('should throw an error if the device does not exist', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue(null);

      await expect(actorsService.createActor({} as any)).rejects.toBeInstanceOf(
        DeviceNotFoundError,
      );
    });

    it('should throw an error if the max number of actors has been reached for the device', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({
        actors: [{}, {}, {}],
      } as any);

      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(
        new TestingDevice(3, 3),
      );

      void mockActorSensorTypesService.getRawActorType.mockResolvedValue(
        new TestingActor(),
      );

      await expect(actorsService.createActor({} as any)).rejects.toBeInstanceOf(
        MaximumActorsForDeviceError,
      );
    });

    it('sends MQTT authorization update when required credentials are MQTT', async () => {
      const validateActorCount = vi.fn().mockReturnValue(false);
      const validateConfiguration = vi.fn().mockResolvedValue(undefined);

      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-42',
        type: 'TestDeviceType',
        config: {},
      } as any);

      void mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        actors: [],
        validateActorCount,
        connectionType: CommunicationType.MQTT,
      } as any);

      void mockActorSensorTypesService.getRawActorType.mockResolvedValue({
        name: 'Actor',
        validateConfiguration,
        communicationType: CommunicationType.MQTT,
        getTopics: vi.fn().mockReturnValue({
          publishTopics: ['ftss/device-42/sensor/sensor-5/reading'],
          subscribeTopics: [],
        }),
      } as unknown as MqttActor<any, any>);

      void mockActorRepository.create.mockResolvedValue({
        id: 'actor-5',
      } as any);

      const result = await actorsService.createActor({
        type: 'Actor',
        device_id: 'device-42',
        name: 'Actor',
        config: {},
      });

      expect(validateActorCount).toHaveBeenCalledWith(0);
      expect(mockMqttService.sendMessage).toHaveBeenCalledTimes(1);

      const message = mockMqttService.sendMessage.mock.calls[0][0];
      expect(message).toBeInstanceOf(UpdateAuthorizePublishSubscribe);
      expect(message.payload).toStrictEqual({
        username: 'device-42',
        authorizePublish: ['ftss/device-42/sensor/sensor-5/reading'],
        authorizeSubscribe: [],
      });
      expect(result).toStrictEqual({ id: 'actor-5' });
    });
  });
});
