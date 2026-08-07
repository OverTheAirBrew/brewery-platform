import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
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
