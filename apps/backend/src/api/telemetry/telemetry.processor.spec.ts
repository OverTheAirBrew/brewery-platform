import { beforeEach, describe, expect, it } from 'vitest';
import { TelemetryProcessor } from './telemetry.processor';
import { Mocked, TestBed } from '@suites/unit';
import { TelemetryService } from './telemetry.service';

describe('TelemetryProcessor', () => {
  let processor: TelemetryProcessor;
  let telemetryService: Mocked<TelemetryService>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(TelemetryProcessor).compile();

    processor = unit;
    telemetryService = unitRef.get<TelemetryService>(TelemetryService);
  });

  it('forwards incoming telemetry payload to the telemetry service', async () => {
    await processor.process({
      data: {
        payload: {
          device_id: 'device-1',
          sensor_id: 'sensor-1',
          value: 24.1,
        },
      },
    } as any);

    expect(telemetryService.createTelemetry).toHaveBeenCalledWith({
      device_id: 'device-1',
      sensor_id: 'sensor-1',
      value: 24.1,
    });
  });

  it('rethrows when telemetry service fails', async () => {
    const error = new Error('telemetry failed');
    void telemetryService.createTelemetry.mockRejectedValueOnce(error);

    await expect(
      processor.process({
        data: {
          payload: {
            device_id: 'device-1',
            sensor_id: 'sensor-1',
            value: 24.1,
          },
        },
      } as any),
    ).rejects.toThrow('telemetry failed');
  });
});
