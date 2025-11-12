import { Inject, Injectable } from '@nestjs/common';
import { IGpioSet } from './gpioset';

@Injectable()
export class GpioService {
  private gpioName = (gpio: number) => `GPIO${gpio}`;

  constructor(@Inject(IGpioSet) private gpioSet: IGpioSet) {}

  public setValue(gpioNumber: number, value: 0 | 1): void {
    this.gpioSet.write({
      gpioNumber,
      gpioName: this.gpioName(gpioNumber),
      value: value.toString(),
    });
  }
}
