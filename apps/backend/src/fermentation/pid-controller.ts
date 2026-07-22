import { Injectable } from "@nestjs/common";

export enum ThermalAction {
  HEAT = "heat",
  COOL = "cool",
  IDLE = "idle",
}

/**
 * Immutable snapshot of the controller passed between iterations.
 * Feed `PIDResult.nextState` back as the `state` argument on every
 * subsequent `tick` call.
 *
 * Configuration fields (set once, never mutated)
 * ------------------------------------------------
 * kp                Proportional gain.
 * ki                Integral gain.
 * kd                Derivative gain.
 *
 * Running-state fields (updated automatically each tick, omit on first call)
 * ---------------------------------------------------------------------------
 * previousError     Error value recorded on the previous tick.
 * integral          Accumulated integral term.
 * lastTimestamp     Unix ms timestamp of the previous tick; omit on first call.
 */
export type PIDState = {
  // Configuration
  readonly kp: number;
  readonly ki: number;
  readonly kd: number;

  // Running state (optional — omit on the first call)
  readonly previousError?: number;
  readonly integral?: number;
  readonly lastTimestamp?: number;
};

/**
 * Result of a single `tick` call.
 *
 * action                  Whether to HEAT, COOL, or stay IDLE this cycle.
 * actionDurationSeconds   How long (seconds) to apply the action; always
 *                         equal to `cycleTimeSeconds` when heating or cooling
 *                         (the actuator is either fully on or fully off).
 * waitSeconds             Pause after the action before the next iteration.
 *                         Decreases as demand increases; 0 at full demand.
 *                         Equals `cycleTimeSeconds` when IDLE (periodic recheck).
 * nextState               Pass this as `state` on the next `tick` call.
 */
export type PIDResult = {
  readonly action: ThermalAction;
  readonly actionDurationSeconds: number;
  readonly waitSeconds: number;
  readonly nextState: PIDState;
};

@Injectable()
export class PidControllerService {
  private readonly cycleTimeSeconds = 10;
  private readonly maxOutput = 1;
  private readonly integralLimit = 20;
  private readonly deadBand = 0.02;

  /**
   * Run one PID iteration.
   *
   * @param state        PIDState from the previous tick, or an initial state
   *                     with only the gains set.
   * @param setpoint     Target temperature (same units as `currentTemp`).
   * @param currentTemp  Current measured temperature of the vessel.
   */
  process(state: PIDState, setpoint: number, currentTemp: number): PIDResult {
    const now = Date.now();
    const { previousError = 0, integral = 0, lastTimestamp = 0 } = state;
    const error = setpoint - currentTemp;

    // Time delta — zero on the first iteration so derivative/integral are
    // skipped, preventing a large transient spike.
    const dt = lastTimestamp !== 0 ? (now - lastTimestamp) / 1000 : 0;

    // --- Integral with anti-windup clamp -----------------------------------
    const rawIntegral = dt > 0 ? integral + error * dt : integral;
    const newIntegral = Math.max(-this.integralLimit, Math.min(this.integralLimit, rawIntegral));

    // --- Derivative --------------------------------------------------------
    const derivative = dt > 0 ? (error - previousError) / dt : 0;

    // --- PID sum, clamped to ±maxOutput ------------------------------------
    const rawOutput = state.kp * error + state.ki * newIntegral + state.kd * derivative;
    const output = Math.max(-this.maxOutput, Math.min(this.maxOutput, rawOutput));

    // --- Map output to on/off duty cycle -----------------------------------
    // Normalise magnitude to [0, 1]; sign determines heat vs. cool.
    const duty = Math.abs(output) / this.maxOutput;

    let action: ThermalAction;
    let actionDuration: number;
    let waitSeconds: number;

    // On/off: the actuator is always at full power when active.
    // PID demand controls how often pulses fire (via waitSeconds), not their length.
    if (duty <= this.deadBand) {
      action = ThermalAction.IDLE;
      actionDuration = 0;
      waitSeconds = parseFloat(this.cycleTimeSeconds.toFixed(3));
    } else if (output > 0) {
      action = ThermalAction.HEAT;
      actionDuration = this.cycleTimeSeconds;
      waitSeconds = duty < 1 ? parseFloat(((this.cycleTimeSeconds * (1 - duty)) / duty).toFixed(3)) : 0;
    } else {
      action = ThermalAction.COOL;
      actionDuration = this.cycleTimeSeconds;
      waitSeconds = duty < 1 ? parseFloat(((this.cycleTimeSeconds * (1 - duty)) / duty).toFixed(3)) : 0;
    }

    // --- Build next state (same shape as input) ----------------------------
    const nextState: PIDState = {
      ...state,
      previousError: error,
      integral: newIntegral,
      lastTimestamp: now,
    };

    return {
      action,
      actionDurationSeconds: parseFloat(actionDuration.toFixed(3)),
      waitSeconds,
      nextState,
    };
  }
}
