import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryService } from './telemetry.service';
import { Mocked, TestBed } from '@suites/unit';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Telemetry } from '../../data/entities/telemetry.entity';
import { Sensor } from '../../data/entities/sensor.entity';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let telemetryRepository: Mocked<typeof Telemetry>;
  let sensorRepository: Mocked<typeof Sensor>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(TelemetryService).compile();

    service = unit;
    telemetryRepository = unitRef.get<typeof Telemetry>(
      REPOSITORIES.TelemetryRepository,
    );
    sensorRepository = unitRef.get<typeof Sensor>(
      REPOSITORIES.SensorRepository,
    );
  });

  describe('createTelemetry', () => {
    it('creates telemetry when sensor exists for the device', async () => {
      const payload = {
        sensor_id: 'sensor-1',
        device_id: 'device-1',
        value: 22.6,
      };

      void sensorRepository.findOne.mockResolvedValue({
        id: 'sensor-1',
      } as any);
      void telemetryRepository.create.mockResolvedValue({
        id: 'telemetry-1',
      } as any);

      const result = await service.createTelemetry(payload);

      expect(sensorRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'sensor-1',
          device_id: 'device-1',
        },
      });
      expect(telemetryRepository.create).toHaveBeenCalledWith(payload);
      expect(result).toStrictEqual({ id: 'telemetry-1' });
    });

    it('returns null and warns when sensor does not exist for the device', async () => {
      const payload = {
        sensor_id: 'sensor-404',
        device_id: 'device-1',
        value: 18,
      };

      void sensorRepository.findOne.mockResolvedValue(null);
      const warnSpy = vi
        .spyOn((service as any).logger, 'warn')
        .mockImplementation(() => {});

      const result = await service.createTelemetry(payload);

      expect(result).toBeNull();
      expect(telemetryRepository.create).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        'Skipping telemetry creation: Sensor with ID sensor-404 not found for device ID device-1',
      );
    });
  });
});
