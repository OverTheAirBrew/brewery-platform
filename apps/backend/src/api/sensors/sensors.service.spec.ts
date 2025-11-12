import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Mocked, TestBed } from '@suites/unit';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Device } from '../../data/entities/device.entity';
import { Sensor } from '../../data/entities/sensor.entity';
import { DeviceTypesService } from '../device-types/device-types.service';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { SensorsService } from './sensors.service';
import { RequiredCredentials } from '@overtheairbrew/plugins';
import { UpdateAuthorizePublishSubscribe } from '../../mqtt-client/events/update-mqtt-user-authorize-publish-subscribe';

describe('SensorsService', () => {
  let sensorsService: SensorsService;

  let mockDeviceRepository: Mocked<typeof Device>;
  let mockSensorRepository: Mocked<typeof Sensor>;
  let mockDeviceTypesService: Mocked<DeviceTypesService>;
  let mockMqttService: Mocked<MqttService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(SensorsService).compile();

    sensorsService = unit;

    mockDeviceRepository = unitRef.get<typeof Device>(
      REPOSITORIES.DeviceRepository,
    );
    mockSensorRepository = unitRef.get<typeof Sensor>(
      REPOSITORIES.SensorRepository,
    );
    mockDeviceTypesService =
      unitRef.get<DeviceTypesService>(DeviceTypesService);
    mockMqttService = unitRef.get<MqttService>(MqttService);
  });

  describe('createSensor', () => {
    const sensorDto = {
      device_id: 'device-1',
      type: 'TemperatureSensor',
      config: { channel: 1 },
    } as any;

    it('creates a sensor and returns id when the device type does not require MQTT', async () => {
      const validateSensorCount = vi.fn().mockReturnValue(false);
      const validateConfiguration = vi.fn().mockResolvedValue(undefined);

      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-1',
        type: 'TestDeviceType',
        config: { bus: 2 },
        sensors: [{ id: 's1' }],
      } as any);
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [
          {
            name: 'TemperatureSensor',
            validateConfiguration,
          },
        ],
        validateSensorCount,
        requiredCredentials: RequiredCredentials.None,
      } as any);
      void mockSensorRepository.create.mockResolvedValue({
        id: 'sensor-99',
      } as any);

      const result = await sensorsService.createSensor(sensorDto);

      expect(mockDeviceRepository.findByPk).toHaveBeenCalledWith('device-1', {
        attributes: ['id', 'type'],
        include: [
          {
            model: Sensor,
            as: 'sensors',
            attributes: ['id'],
          },
        ],
      });
      expect(mockDeviceTypesService.getByNameRaw).toHaveBeenCalledWith(
        'TestDeviceType',
      );
      expect(validateSensorCount).toHaveBeenCalledWith(1);
      expect(validateConfiguration).toHaveBeenCalledWith(
        { bus: 2 },
        { channel: 1 },
      );
      expect(mockSensorRepository.create).toHaveBeenCalledWith(sensorDto);
      expect(mockMqttService.sendMessage).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ id: 'sensor-99' });
    });

    it('sends MQTT authorization update when required credentials are MQTT', async () => {
      const validateSensorCount = vi.fn().mockReturnValue(false);
      const validateConfiguration = vi.fn().mockResolvedValue(undefined);

      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-42',
        type: 'TestDeviceType',
        config: {},
      } as any);
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [
          {
            name: 'TemperatureSensor',
            validateConfiguration,
          },
        ],
        validateSensorCount,
        requiredCredentials: RequiredCredentials.MQTT,
      } as any);
      void mockSensorRepository.create.mockResolvedValue({
        id: 'sensor-5',
      } as any);

      const result = await sensorsService.createSensor(sensorDto);

      expect(validateSensorCount).toHaveBeenCalledWith(0);
      expect(mockMqttService.sendMessage).toHaveBeenCalledTimes(1);

      const message = mockMqttService.sendMessage.mock.calls[0][0];
      expect(message).toBeInstanceOf(UpdateAuthorizePublishSubscribe);
      expect(message.payload).toStrictEqual({
        username: 'device-42',
        authorizePublish: ['ftss/device-42/sensor/sensor-5/reading'],
      });
      expect(result).toStrictEqual({ id: 'sensor-5' });
    });

    it('throws when device does not exist', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue(null);

      await expect(sensorsService.createSensor(sensorDto)).rejects.toThrow(
        new BadRequestException('Device with ID device-1 not found'),
      );

      expect(mockDeviceTypesService.getByNameRaw).not.toHaveBeenCalled();
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
    });

    it('throws when device type does not exist', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-1',
        type: 'MissingType',
        sensors: [],
      } as any);
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue(null as any);

      await expect(sensorsService.createSensor(sensorDto)).rejects.toThrow(
        new BadRequestException('Device type MissingType not found'),
      );

      expect(mockSensorRepository.create).not.toHaveBeenCalled();
    });

    it('throws when requested sensor type is not available for the device type', async () => {
      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-1',
        type: 'TestDeviceType',
        sensors: [],
      } as any);
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [{ name: 'OtherSensor', validateConfiguration: vi.fn() }],
        validateSensorCount: vi.fn().mockReturnValue(false),
      } as any);

      await expect(sensorsService.createSensor(sensorDto)).rejects.toThrow(
        new BadRequestException(
          'Sensor type TemperatureSensor not found for device type TestDeviceType',
        ),
      );

      expect(mockSensorRepository.create).not.toHaveBeenCalled();
    });

    it('throws when maximum number of sensors has been exceeded for the device type', async () => {
      const validateConfiguration = vi.fn().mockResolvedValue(undefined);
      const validateSensorCount = vi.fn().mockReturnValue(true);

      void mockDeviceRepository.findByPk.mockResolvedValue({
        id: 'device-1',
        type: 'TestDeviceType',
        sensors: [{ id: 's1' }, { id: 's2' }],
      } as any);
      void mockDeviceTypesService.getByNameRaw.mockResolvedValue({
        sensors: [{ name: 'TemperatureSensor', validateConfiguration }],
        validateSensorCount,
      } as any);

      await expect(sensorsService.createSensor(sensorDto)).rejects.toThrow(
        new BadRequestException(
          'Maximum number of sensors exceeded for device type TestDeviceType',
        ),
      );

      expect(validateConfiguration).not.toHaveBeenCalled();
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('returns all sensors from repository', async () => {
      void mockSensorRepository.findAll.mockResolvedValue([
        { id: 's1' },
        { id: 's2' },
      ] as any);

      const result = await sensorsService.getAll();

      expect(mockSensorRepository.findAll).toHaveBeenCalledWith();
      expect(result).toStrictEqual([{ id: 's1' }, { id: 's2' }]);
    });
  });

  describe('getSensorsWithDeviceInfo', () => {
    it('returns sensors mapped with selected device information', async () => {
      void mockSensorRepository.findAll.mockResolvedValue([
        {
          id: 'sensor-1',
          type: 'LocalDeviceDummySensor',
          config: { pin: 'A0' },
          device: {
            id: 'device-1',
            config: { interval: 10 },
          },
        },
      ] as any);

      const result = await sensorsService.getSensorsWithDeviceInfo();

      expect(mockSensorRepository.findAll).toHaveBeenCalledWith({
        where: {
          type: ['LocalDeviceDummySensor'],
        },
        include: [
          {
            model: Device,
            attributes: ['id', 'config'],
          },
        ],
        attributes: ['id', 'type', 'config'],
      });
      expect(result).toStrictEqual([
        {
          id: 'sensor-1',
          type: 'LocalDeviceDummySensor',
          config: { pin: 'A0' },
          device: {
            id: 'device-1',
            config: { interval: 10 },
          },
        },
      ]);
    });
  });
});
