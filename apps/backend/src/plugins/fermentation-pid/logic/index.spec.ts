import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FermentationPid, FermentationPIDState } from '.';
import { ThermalAction } from '@overtheairbrew/plugins';

describe('PidControllerService', () => {
  let service: FermentationPid;

  // Constants mirroring the private fields on the service
  const CYCLE_TIME = 10;

  const baseState: FermentationPIDState = { kp: 1, ki: 0, kd: 0 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FermentationPid],
    }).compile();

    service = module.get(FermentationPid);
  });

  describe('first iteration (no prior state)', () => {
    it('returns HEAT when current temp is below setpoint', async () => {
      const result = await service.process(baseState, 70, 75);
      expect(result.type).toBe(ThermalAction.HEAT);
    });

    it('returns COOL when current temp is above setpoint', async () => {
      const result = await service.process(baseState, 80, 75);
      expect(result.type).toBe(ThermalAction.COOL);
    });

    it('returns IDLE when current temp is within dead band of setpoint', async () => {
      // With kp=1 and maxOutput=1, error must be <= deadBand (0.02) to idle
      const result = await service.process(baseState, 75, 75.01);
      expect(result.type).toBe(ThermalAction.IDLE);
    });

    it('skips derivative and integral on first call (no timestamp)', async () => {
      // On the first call dt=0, so the output is purely proportional.
      // error = 75 - 70 = 5; rawOutput = kp*5 = 5; clamped to maxOutput=1
      const result = await service.process(baseState, 75, 70);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });
  });

  describe('action duration', () => {
    it('sets actionDurationSeconds to cycleTimeSeconds when heating', async () => {
      const result = await service.process(baseState, 70, 75);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });

    it('sets actionDurationSeconds to cycleTimeSeconds when cooling', async () => {
      const result = await service.process(baseState, 80, 75);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });

    it('sets actionDurationSeconds to 0 when idle', async () => {
      const result = await service.process(baseState, 75, 75);
      expect(result.actionDurationSeconds).toBe(0);
    });
  });

  describe('waitSeconds', () => {
    it('returns 0 wait at full demand (clamped output)', async () => {
      // Large error forces output to maxOutput (duty=1)
      const result = await service.process(baseState, 0, 75);
      expect(result.waitSeconds).toBe(0);
    });

    it('returns cycleTimeSeconds as wait when idle', async () => {
      const result = await service.process(baseState, 75, 75);
      expect(result.waitSeconds).toBe(CYCLE_TIME);
    });

    it('returns a positive wait when demand is partial', async () => {
      // kp=0.1 so a small error produces a sub-maxOutput result
      const partialState: FermentationPIDState = { kp: 0.1, ki: 0, kd: 0 };
      // error=1, rawOutput=0.1, duty=0.1 → wait = 10*(0.9/0.1) = 90
      const result = await service.process(partialState, 74, 75);
      expect(result.waitSeconds).toBeGreaterThan(0);
    });

    it('returns a positive wait when cooling demand is partial', async () => {
      // kp=0.1, error=-1 → rawOutput=-0.1, duty=0.1 → wait = 10*(0.9/0.1) = 90
      const result = await service.process({ kp: 0.1, ki: 0, kd: 0 }, 76, 75);
      expect(result.type).toBe(ThermalAction.COOL);
      expect(result.waitSeconds).toBeGreaterThan(0);
    });

    it('waitSeconds decreases as error (demand) increases', async () => {
      const smallError = await service.process(
        { kp: 0.1, ki: 0, kd: 0 },
        75,
        74,
      ); // error=1
      const largeError = await service.process(
        { kp: 0.1, ki: 0, kd: 0 },
        75,
        72,
      ); // error=3
      expect(largeError.waitSeconds).toBeLessThan(smallError.waitSeconds);
    });
  });

  describe('nextState', () => {
    it('preserves kp, ki, kd in nextState', async () => {
      const state: FermentationPIDState = { kp: 0.5, ki: 0.1, kd: 0.2 };
      const result = await service.process(state, 75, 70);
      expect(result.nextState.kp).toBe(0.5);
      expect(result.nextState.ki).toBe(0.1);
      expect(result.nextState.kd).toBe(0.2);
    });

    it('records previousError as setpoint minus currentTemp', async () => {
      const result = await service.process(baseState, 70, 75);
      expect(result.nextState.previousError).toBe(5);
    });

    it('sets lastTimestamp to a recent unix ms value', async () => {
      const before = Date.now();
      const result = await service.process(baseState, 70, 75);
      const after = Date.now();
      expect(result.nextState.lastTimestamp).toBeGreaterThanOrEqual(before);
      expect(result.nextState.lastTimestamp).toBeLessThanOrEqual(after);
    });

    it('keeps integral at 0 on first call (dt=0)', async () => {
      const result = await service.process(baseState, 70, 75);
      expect(result.nextState.integral).toBe(0);
    });
  });

  describe('integral accumulation', () => {
    it('accumulates integral over successive calls', async () => {
      vi.useFakeTimers();

      const state: FermentationPIDState = { kp: 0, ki: 1, kd: 0 };
      const first = await service.process(state, 70, 75); // error=5, dt=0 → integral stays 0

      vi.advanceTimersByTime(1000); // advance 1 second
      const second = await service.process(first.nextState, 70, 75); // dt=1s, integral += 5*1 = 5

      expect(second.nextState.integral).toBeCloseTo(5, 1);

      vi.useRealTimers();
    });

    it('clamps integral at integralLimit to prevent windup', async () => {
      vi.useFakeTimers();

      // Drive a large sustained error to saturate the integral
      let state: FermentationPIDState = { kp: 0, ki: 1, kd: 0 };
      for (let i = 0; i < 10; i++) {
        state = (await service.process(state, 75, 0)).nextState; // error=75 each tick
        vi.advanceTimersByTime(1000);
      }

      // integral should be clamped to integralLimit (20)
      expect(state.integral).toBeLessThanOrEqual(20);

      vi.useRealTimers();
    });

    it('clamps integral at negative integralLimit to prevent windup when cooling', async () => {
      vi.useFakeTimers();

      // Drive a large sustained negative error to saturate the integral negatively
      let state: FermentationPIDState = { kp: 0, ki: 1, kd: 0 };
      for (let i = 0; i < 10; i++) {
        state = (await service.process(state, 75, 150)).nextState; // error=-75 each tick
        vi.advanceTimersByTime(1000);
      }

      // integral should be clamped to -integralLimit (-20)
      expect(state.integral).toBeGreaterThanOrEqual(-20);

      vi.useRealTimers();
    });
  });

  describe('state passthrough', () => {
    it('nextState can be fed directly into the next process call', async () => {
      vi.useFakeTimers();

      const first = await service.process(baseState, 75, 70);
      vi.advanceTimersByTime(500);
      const second = await service.process(first.nextState, 75, 72);

      expect(second.type).toBeDefined();
      expect(second.nextState).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe('dead band', () => {
    it('emits IDLE for errors at or below the dead band threshold', async () => {
      // dead band = 0.02 of maxOutput=1; with kp=1 error must be <= 0.02
      const result = await service.process(baseState, 75, 75.02);
      expect(result.type).toBe(ThermalAction.IDLE);
    });

    it('emits HEAT for errors just above the dead band threshold', async () => {
      const result = await service.process(baseState, 74.97, 75);
      expect(result.type).toBe(ThermalAction.HEAT);
    });
  });
});
