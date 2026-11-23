import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypesService } from './device-types.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceTypeNotFoundError } from './errors/device-type-not-found-error';
import { TestBed } from '@suites/unit';
import type { Mocked } from 'vitest';
import { JsonSchemaGeneratorService } from '../../json-schema-generator/json-schema-generator.service';

describe('DeviceTypesService', () => {
  let deviceTypesService: DeviceTypesService;
  let jsonSchemaGenerator: Mocked<JsonSchemaGeneratorService>;

  const mockDevices: Partial<Device<any>>[] = [
    {
      name: 'device1',
      getConfigOptions: vi.fn().mockResolvedValue([]),
    },
  ];

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(DeviceTypesService)
      .mock<Device<any>[]>(DeviceIdentifier)
      .final([...(mockDevices as Device<any>[])])
      .compile();

    jsonSchemaGenerator = unitRef.get(JsonSchemaGeneratorService);
    jsonSchemaGenerator.generateSchema.mockResolvedValue({});
    jsonSchemaGenerator.generateIfSchema.mockResolvedValue({});

    deviceTypesService = unit;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of device types', async () => {
      const result = await deviceTypesService.getAll();

      expect(jsonSchemaGenerator.generateSchema).toHaveBeenCalled();
      expect(jsonSchemaGenerator.generateIfSchema).toHaveBeenCalled();
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
