import {
  NumberPropertyOutput,
  SelectBoxPropertyOutput,
  StringPropertyOutput,
} from './properties';

interface StringOptions {
  required: boolean;
  placeholder?: string;
}

interface NumberOptions {
  required: boolean;
  defaultValue?: number;
}

type SelectBoxValues =
  | ((config: any) => Promise<string[]>)
  | ((config: any) => string[])
  | Array<string>;

interface SelectBoxOptions {
  required: boolean;
  values: SelectBoxValues;
  defaultValue?: string;
}

interface IInput {
  getData(config: any): Promise<any>;
}

class StringInput implements IInput {
  constructor(
    private name: string,
    private options: StringOptions,
  ) {}

  async getData() {
    return new StringPropertyOutput(
      this.name,
      this.options.required || false,
      this.options.placeholder || '',
    );
  }
}

class NumberInput implements IInput {
  constructor(
    private name: string,
    private options: NumberOptions,
  ) {}

  async getData() {
    return new NumberPropertyOutput(
      this.name,
      this.options.required || false,
      this.options.defaultValue || 0,
    );
  }
}

class SelectBoxInput implements IInput {
  constructor(
    private name: string,
    private options: SelectBoxOptions,
  ) {}

  async getData(config: any) {
    let values: string[];

    if (typeof this.options.values === 'function') {
      values = await this.options.values(config);
    } else {
      values = this.options.values;
    }

    return new SelectBoxPropertyOutput(
      this.name,
      this.options.required || false,
      values,
      this.options.defaultValue || '',
    );
  }
}

export class Form {
  constructor() {}

  private inputs: IInput[] = [];

  addString(name: string, options: StringOptions): Form {
    this.inputs.push(new StringInput(name, options));
    return this;
  }

  addInteger(name: string, options: NumberOptions): Form {
    this.inputs.push(new NumberInput(name, options));
    return this;
  }

  addSelectBox(name: string, options: SelectBoxOptions): Form {
    this.inputs.push(new SelectBoxInput(name, options));
    return this;
  }

  async build(config: any) {
    return await Promise.all(this.inputs.map((input) => input.getData(config)));
  }
}
