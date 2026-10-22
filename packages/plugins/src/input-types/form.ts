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
  getData(config: any): Promise<IData>;
}

class StringInput implements IInput {
  constructor(
    private name: string,
    private options: StringOptions,
  ) {}

  async getData(): Promise<IData> {
    return {
      name: this.name,
      required: this.options.required || false,
      placeholder: this.options.placeholder || '',
      type: 'string',
    };
  }
}

interface IData {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'select-box';
  placeholder?: string;
  defaultValue?: number | string;
  values?: string[];
}

class NumberInput implements IInput {
  constructor(
    private name: string,
    private options: NumberOptions,
  ) {}

  async getData(): Promise<IData> {
    return {
      name: this.name,
      required: this.options.required || false,
      defaultValue: this.options.defaultValue || 0,
      type: 'number',
    };
  }
}

class SelectBoxInput implements IInput {
  constructor(
    private name: string,
    private options: SelectBoxOptions,
  ) {}

  async getData(config: any): Promise<IData> {
    let values: string[];

    if (typeof this.options.values === 'function') {
      values = await this.options.values(config);
    } else {
      values = this.options.values;
    }

    return {
      name: this.name,
      required: this.options.required || false,
      values,
      defaultValue: this.options.defaultValue || '',
      type: 'select-box',
    };
  }
}

export type InputType = StringInput | NumberInput | SelectBoxInput;
export type OutputType =
  StringPropertyOutput | NumberPropertyOutput | SelectBoxPropertyOutput;

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

  async build(
    config: any,
  ): Promise<{ properties: Record<string, any>; required: string[] }> {
    const inputs = await Promise.all(
      this.inputs.map((input) => input.getData(config)),
    );

    const props = inputs.reduce(
      (acc, prop) => {
        let values: string[] | undefined = undefined;

        if (prop.type === 'select-box') {
          values = prop.values;
        }

        acc[prop.name] = {
          title: prop.name,
          type: prop.type,
          default: prop.defaultValue ?? undefined,
          enum: values,
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    const requiredProperties = inputs
      .filter((input) => input.required)
      .map((input) => input.name);

    return {
      properties: props,
      required: requiredProperties,
    };
  }
}
