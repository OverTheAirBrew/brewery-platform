
export class StringPropertyOutput {
  constructor(name: string, required: boolean, placeholder: string) {
    this.name = name;
    this.type = 'string';
    this.required = required;
    this.placeholder = placeholder;
  }

  name: string;
  type: string;
  required: boolean;
  placeholder: string;
}

export class NumberPropertyOutput {
  constructor(name: string, required: boolean, defaultValue: number) {
    this.name = name;
    this.type = 'number';
    this.required = required;
    this.defaultValue = defaultValue;
  }

  name: string;
  type: string;
  required: boolean;
  defaultValue: number;
}

export class SelectBoxPropertyOutput {
  constructor(
    name: string,
    required: boolean,
    values: string[],
    defaultValue: string
  ) {
    this.name = name;
    this.type = 'select-box';
    this.required = required;
    this.values = values;
    this.defaultValue = defaultValue;
  }

  name: string;
  type: string;
  required: boolean;
  values: string[];
  defaultValue: string;
}
