import { TestBed } from '@suites/unit';
import { beforeEach, describe, expect, it } from 'vitest';
import { FtssDevice } from './device';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

describe('FTSS Device Plugin', () => {
  let device: FtssDevice;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(FtssDevice).compile();
    device = unit;
  });

  it('should validate the configuration correctly', async () => {
    const isValid = await device.validateConfiguration({
      device_id: 'test-id',
    });

    expect(isValid).toBeTruthy();
  });

  it('should throw an error for invalid configuration', async () => {
    const isValid = await device.validateConfiguration({
      device_id: '',
    });

    expect(isValid).toBeFalsy();
  });

  it('should return the correct topics', () => {
    const topics = device.getTopics();
    expect(topics).toHaveProperty('publishTopics');
    expect(topics).toHaveProperty('subscribeTopics');

    expect(topics.publishTopics).toStrictEqual([]);
    expect(topics.subscribeTopics).toStrictEqual([]);
  });
});
