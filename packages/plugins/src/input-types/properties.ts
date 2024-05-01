import { ApiProperty } from '@nestjs/swagger';

export class StringPropertyOutput {
  constructor(name: string, required: boolean, placeholder: string) {
    this.name = name;
    this.type = 'string';
    this.required = required;
    this.placeholder = placeholder;
  }

  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  type: string;

  @ApiProperty({
    type: 'boolean',
  })
  required: boolean;

  @ApiProperty({
    type: 'string',
  })
  placeholder: string;
}

export class NumberPropertyOutput {
  constructor(name: string, required: boolean, defaultValue: number) {
    this.name = name;
    this.type = 'number';
    this.required = required;
    this.defaultValue = defaultValue;
  }

  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  type: string;

  @ApiProperty({
    type: 'boolean',
  })
  required: boolean;

  @ApiProperty({
    type: 'number',
  })
  defaultValue: number;
}

export class SelectBoxPropertyOutput {
  constructor(
    name: string,
    required: boolean,
    values: string[],
    defaultValue: string,
  ) {
    this.name = name;
    this.type = 'select-box';
    this.required = required;
    this.values = values;
    this.defaultValue = defaultValue;
  }

  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  type: string;

  @ApiProperty({
    type: 'boolean',
  })
  required: boolean;

  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  values: string[];

  @ApiProperty({
    type: 'string',
  })
  defaultValue: string;
}
