import { TestBed } from '@suites/unit';
import { describe, expect, it } from 'vitest';
import { LocalDevice } from './device';

describe('Local Device Plugin', () => {
  it('should validate the config', async () => {
    const { unit } = await TestBed.solitary(LocalDevice).compile();

    const response = await unit.validateConfiguration({});
    expect(response).toBeTruthy();
  });

  it('should return false for an invalid config', async () => {
    const { unit } = await TestBed.solitary(LocalDevice).compile();

    const response = await unit.validateConfiguration({ invalid: true });
    expect(response).toBeFalsy();
  });
});
