import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypesService } from './device-types.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { DeviceTypeNotFoundError } from './errors/device-type-not-found-error';

describe('DeviceTypesService', () => {
  let deviceTypesService: DeviceTypesService;

  const mockDevices: Partial<Device<any>>[] = [
    {
      name: 'device1',
      getConfigOptions: vi.fn().mockResolvedValue([]),
    },
  ];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeviceTypesService,
        {
          provide: DeviceIdentifier,
          useValue: mockDevices,
        },
      ],
    }).compile();
    deviceTypesService = module.get<DeviceTypesService>(DeviceTypesService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of device types', async () => {
      const result = await deviceTypesService.getAll();
      expect(result).toMatchObject([
        {
          name: 'device1',
          properties: expect.any(Array),
        },
      ]);
    });
  });

  describe('getByNameRaw', () => {
    it('should return the device with the given name', async () => {
      const result = await deviceTypesService.getByNameRaw('device1');
      expect(result).toMatchObject({
        name: 'device1',
        getConfigOptions: expect.any(Function),
      });
    });

    it('should throw an error if the device is not found', async () => {
      await expect(
        deviceTypesService.getByNameRaw('nonexistent'),
      ).rejects.toBeInstanceOf(DeviceTypeNotFoundError);
    });
  });
});
