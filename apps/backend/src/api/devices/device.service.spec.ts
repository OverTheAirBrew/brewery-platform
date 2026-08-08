import { DeviceService } from './device.service';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { Mocked, TestBed } from '@suites/unit';
import { Device } from '../../data/entities/device.entity';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { REPOSITORIES } from '../../data/data.abstractions';
import { DeviceTypesService } from '../device-types/device-types.service';
import { TestingDevice } from '../../../test/helpers/test-providers/device';
import { RequiredCredentials } from '@overtheairbrew/plugins';
import { DeviceNotFoundError } from './errors/device-not-found-error';

describe('DeviceService', () => {
  let deviceService: DeviceService;

  let mockDeviceRepository: Mocked<typeof Device>;
  let mockMqttService: Mocked<MqttService>;
  let mockDeviceTypeService: Mocked<DeviceTypesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(DeviceService).compile();

    deviceService = unit;

    mockDeviceRepository = unitRef.get<typeof Device>(
      REPOSITORIES.DeviceRepository,
    );
    mockMqttService = unitRef.get<MqttService>(MqttService);
    mockDeviceTypeService = unitRef.get<DeviceTypesService>(DeviceTypesService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createDevice', () => {
    it('should create a new device', async () => {
      void mockDeviceRepository.create.mockResolvedValue({ id: 1 } as any);
      void mockDeviceTypeService.getByNameRaw.mockResolvedValue(
        new TestingDevice(),
      );

      const { id, password } = await deviceService.createDevice({
        name: 'device1',
        type: 'TestingDevice',
        config: {},
      });

      expect(id).toBe(1);
      expect(password).toBeUndefined();
    });

    it('should create a password when the device type requires MQTT credentials', async () => {
      void mockDeviceRepository.create.mockResolvedValue({ id: 1 } as any);
      void mockDeviceTypeService.getByNameRaw.mockResolvedValue(
        new TestingDevice(RequiredCredentials.MQTT),
      );

      const { id, password } = await deviceService.createDevice({
        name: 'device1',
        type: 'TestingDevice',
        config: {},
      });

      expect(id).toBe(1);
      expect(password).toBeDefined();
    });
  });

  describe('getByIds', () => {
    it('should return devices for the given ids', async () => {
      void mockDeviceRepository.findAll.mockResolvedValue([
        { id: 1, name: 'device1' },
        { id: 2, name: 'device2' },
      ] as any);

      const result = await deviceService.getByIds(['1', '2']);

      expect(result).toMatchObject([
        { id: 1, name: 'device1' },
        { id: 2, name: 'device2' },
      ]);
    });
  });

  describe('getSensorTypesForDeviceId', () => {
    it('should return sensor types for the given device id', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({
        type: 'TestingDevice',
      } as any);
      void mockDeviceTypeService.getByNameRaw.mockResolvedValue(
        new TestingDevice(),
      );

      const result = await deviceService.getSensorTypesForDeviceId('1');

      expect(result).toMatchObject([{ name: 'TestingSensor' }]);
    });

    it('should throw an error if the device does not exist', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue(null);

      await expect(
        deviceService.getSensorTypesForDeviceId('1'),
      ).rejects.toBeInstanceOf(DeviceNotFoundError);
    });
  });

  describe('getActorTypesForDeviceId', () => {
    it('should return actor types for the given device id', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({
        type: 'TestingDevice',
      } as any);
      void mockDeviceTypeService.getByNameRaw.mockResolvedValue(
        new TestingDevice(),
      );

      const result = await deviceService.getActorTypesForDeviceId('1');

      expect(result).toMatchObject([{ name: 'TestingActor' }]);
    });

    it('should throw an error if the device does not exist', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue(null);

      await expect(
        deviceService.getActorTypesForDeviceId('1'),
      ).rejects.toBeInstanceOf(DeviceNotFoundError);
    });
  });
});
