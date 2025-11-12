import { ClassType } from '@overtheairbrew/class-type';
import { Utils } from '../utils';

interface IGpioSetInput {
  gpioNumber: number;
  gpioName: string;
  value?: string;
}

export interface IGpioSet {
  write(input: IGpioSetInput): void;
}

export class GpioSetV1_6 implements IGpioSet {
  private readonly chip = 'gpiochip0';

  constructor(private utils: Utils) {}

  public write(input: IGpioSetInput) {
    this.utils.exeFile('gpioset', [
      this.chip,
      input.gpioNumber + '=' + input.value,
    ]);
  }
}

export class GpioSetV2_2 implements IGpioSet {
  constructor(private utils: Utils) {}

  public write(input: IGpioSetInput) {
    const time = 0;

    this.utils.exeFile('gpioset', [
      '-t' + time,
      input.gpioName + '=' + input.value,
    ]);
  }
}

export class GpioSetVDummy implements IGpioSet {
  public write(input: IGpioSetInput) {
    console.log(
      `Dummy GPIO Set: Setting ${input.gpioName} (number ${input.gpioNumber}) to value ${input.value}`,
    );
  }
}

export const IGpioSet = class Dummy {} as ClassType<IGpioSet>;
