import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypesService } from './device-types.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceTypeNotFoundError } from './errors/device-type-not-found-error';
import { TestBed } from '@suites/unit';

describe('DeviceTypesService', () => {
  let deviceTypesService: DeviceTypesService;

  const mockDevices: Partial<Device<any>>[] = [
    {
      name: 'device1',
      getConfigOptions: vi.fn().mockResolvedValue([]),
    },
  ];

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(DeviceTypesService)
      .mock<Device<any>[]>(DeviceIdentifier)
      .final([...(mockDevices as Device<any>[])])
      .compile();

    deviceTypesService = unit;
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
