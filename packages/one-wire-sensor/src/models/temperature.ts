export class Temperature {
  public fahrenheit: number;

  constructor(public celsius: number) {
    this.fahrenheit = celsius * 1.8 + 32;
  }
}
