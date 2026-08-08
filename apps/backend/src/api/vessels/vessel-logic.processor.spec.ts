import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogicProcessingConsumer } from './vessel-logic.processor';
import { Mocked, TestBed } from '@suites/unit';
import { VesselsService } from './vessels.service';

describe('LogicProcessingConsumer', () => {
  let consumer: LogicProcessingConsumer;
  let vesselsService: Mocked<VesselsService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      LogicProcessingConsumer,
    ).compile();

    consumer = unit;
    vesselsService = unitRef.get<VesselsService>(VesselsService);
  });

  it('passes job data to vessels service processLogic', async () => {
    const data = {
      payload: {
        vessel_id: 'vessel-1',
      },
    };

    await consumer.process({ data } as any);

    expect(vesselsService.processLogic).toHaveBeenCalledWith(data);
  });

  it('logs and rethrows processing errors', async () => {
    const error = new Error('processing failed');
    vesselsService.processLogic.mockRejectedValue(error);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(consumer.process({ data: {} } as any)).rejects.toThrow(
      'processing failed',
    );

    expect(errorSpy).toHaveBeenCalledWith('Error processing job:', error);
  });
});
