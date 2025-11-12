import { Logic, LogicReturnType } from '@overtheairbrew/plugins';

export class TestingLogic extends Logic<unknown> {
  protected process(
    state: unknown,
    currentTemp: number,
    targetTemp: number,
  ): Promise<LogicReturnType<unknown>> {
    throw new Error('Method not implemented.');
  }

  async validateConfiguration(logicConfig: unknown): Promise<boolean> {
    return true;
  }
}
