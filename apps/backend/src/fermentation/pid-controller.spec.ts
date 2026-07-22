import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { PidControllerService, PIDState, ThermalAction } from "./pid-controller.service";

describe("PidControllerService", () => {
  let service: PidControllerService;

  // Constants mirroring the private fields on the service
  const CYCLE_TIME = 10;

  const baseState: PIDState = { kp: 1, ki: 0, kd: 0 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PidControllerService],
    }).compile();

    service = module.get(PidControllerService);
  });

  describe("first iteration (no prior state)", () => {
    it("returns HEAT when current temp is below setpoint", () => {
      const result = service.process(baseState, 75, 70);
      expect(result.action).toBe(ThermalAction.HEAT);
    });

    it("returns COOL when current temp is above setpoint", () => {
      const result = service.process(baseState, 75, 80);
      expect(result.action).toBe(ThermalAction.COOL);
    });

    it("returns IDLE when current temp is within dead band of setpoint", () => {
      // With kp=1 and maxOutput=1, error must be <= deadBand (0.02) to idle
      const result = service.process(baseState, 75, 75.01);
      expect(result.action).toBe(ThermalAction.IDLE);
    });

    it("skips derivative and integral on first call (no timestamp)", () => {
      // On the first call dt=0, so the output is purely proportional.
      // error = 75 - 70 = 5; rawOutput = kp*5 = 5; clamped to maxOutput=1
      const result = service.process(baseState, 75, 70);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });
  });

  describe("action duration", () => {
    it("sets actionDurationSeconds to cycleTimeSeconds when heating", () => {
      const result = service.process(baseState, 75, 70);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });

    it("sets actionDurationSeconds to cycleTimeSeconds when cooling", () => {
      const result = service.process(baseState, 75, 80);
      expect(result.actionDurationSeconds).toBe(CYCLE_TIME);
    });

    it("sets actionDurationSeconds to 0 when idle", () => {
      const result = service.process(baseState, 75, 75);
      expect(result.actionDurationSeconds).toBe(0);
    });
  });

  describe("waitSeconds", () => {
    it("returns 0 wait at full demand (clamped output)", () => {
      // Large error forces output to maxOutput (duty=1)
      const result = service.process(baseState, 75, 0);
      expect(result.waitSeconds).toBe(0);
    });

    it("returns cycleTimeSeconds as wait when idle", () => {
      const result = service.process(baseState, 75, 75);
      expect(result.waitSeconds).toBe(CYCLE_TIME);
    });

    it("returns a positive wait when demand is partial", () => {
      // kp=0.1 so a small error produces a sub-maxOutput result
      const partialState: PIDState = { kp: 0.1, ki: 0, kd: 0 };
      // error=1, rawOutput=0.1, duty=0.1 → wait = 10*(0.9/0.1) = 90
      const result = service.process(partialState, 75, 74);
      expect(result.waitSeconds).toBeGreaterThan(0);
    });

    it("returns a positive wait when cooling demand is partial", () => {
      // kp=0.1, error=-1 → rawOutput=-0.1, duty=0.1 → wait = 10*(0.9/0.1) = 90
      const result = service.process({ kp: 0.1, ki: 0, kd: 0 }, 75, 76);
      expect(result.action).toBe(ThermalAction.COOL);
      expect(result.waitSeconds).toBeGreaterThan(0);
    });

    it("waitSeconds decreases as error (demand) increases", () => {
      const smallError = service.process({ kp: 0.1, ki: 0, kd: 0 }, 75, 74); // error=1
      const largeError = service.process({ kp: 0.1, ki: 0, kd: 0 }, 75, 72); // error=3
      expect(largeError.waitSeconds).toBeLessThan(smallError.waitSeconds);
    });
  });

  describe("nextState", () => {
    it("preserves kp, ki, kd in nextState", () => {
      const state: PIDState = { kp: 0.5, ki: 0.1, kd: 0.2 };
      const result = service.process(state, 75, 70);
      expect(result.nextState.kp).toBe(0.5);
      expect(result.nextState.ki).toBe(0.1);
      expect(result.nextState.kd).toBe(0.2);
    });

    it("records previousError as setpoint minus currentTemp", () => {
      const result = service.process(baseState, 75, 70);
      expect(result.nextState.previousError).toBe(5);
    });

    it("sets lastTimestamp to a recent unix ms value", () => {
      const before = Date.now();
      const result = service.process(baseState, 75, 70);
      const after = Date.now();
      expect(result.nextState.lastTimestamp).toBeGreaterThanOrEqual(before);
      expect(result.nextState.lastTimestamp).toBeLessThanOrEqual(after);
    });

    it("keeps integral at 0 on first call (dt=0)", () => {
      const result = service.process(baseState, 75, 70);
      expect(result.nextState.integral).toBe(0);
    });
  });

  describe("integral accumulation", () => {
    it("accumulates integral over successive calls", () => {
      vi.useFakeTimers();

      const state: PIDState = { kp: 0, ki: 1, kd: 0 };
      const first = service.process(state, 75, 70); // error=5, dt=0 → integral stays 0

      vi.advanceTimersByTime(1000); // advance 1 second
      const second = service.process(first.nextState, 75, 70); // dt=1s, integral += 5*1 = 5

      expect(second.nextState.integral).toBeCloseTo(5, 1);

      vi.useRealTimers();
    });

    it("clamps integral at integralLimit to prevent windup", () => {
      vi.useFakeTimers();

      // Drive a large sustained error to saturate the integral
      let state: PIDState = { kp: 0, ki: 1, kd: 0 };
      for (let i = 0; i < 10; i++) {
        state = service.process(state, 75, 0).nextState; // error=75 each tick
        vi.advanceTimersByTime(1000);
      }

      // integral should be clamped to integralLimit (20)
      expect(state.integral).toBeLessThanOrEqual(20);

      vi.useRealTimers();
    });

    it("clamps integral at negative integralLimit to prevent windup when cooling", () => {
      vi.useFakeTimers();

      // Drive a large sustained negative error to saturate the integral negatively
      let state: PIDState = { kp: 0, ki: 1, kd: 0 };
      for (let i = 0; i < 10; i++) {
        state = service.process(state, 75, 150).nextState; // error=-75 each tick
        vi.advanceTimersByTime(1000);
      }

      // integral should be clamped to -integralLimit (-20)
      expect(state.integral).toBeGreaterThanOrEqual(-20);

      vi.useRealTimers();
    });
  });

  describe("state passthrough", () => {
    it("nextState can be fed directly into the next process call", () => {
      vi.useFakeTimers();

      const first = service.process(baseState, 75, 70);
      vi.advanceTimersByTime(500);
      const second = service.process(first.nextState, 75, 72);

      expect(second.action).toBeDefined();
      expect(second.nextState).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe("dead band", () => {
    it("emits IDLE for errors at or below the dead band threshold", () => {
      // dead band = 0.02 of maxOutput=1; with kp=1 error must be <= 0.02
      const result = service.process(baseState, 75, 75.02);
      expect(result.action).toBe(ThermalAction.IDLE);
    });

    it("emits HEAT for errors just above the dead band threshold", () => {
      const result = service.process(baseState, 75, 74.97);
      expect(result.action).toBe(ThermalAction.HEAT);
    });
  });
});
