import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  NumberPropertyOutput,
  SelectBoxPropertyOutput,
  StringPropertyOutput,
} from '@overtheairbrew/plugins';

export type PropertyOutputs =
  | StringPropertyOutput
  | NumberPropertyOutput
  | SelectBoxPropertyOutput;

@ApiExtraModels(
  StringPropertyOutput,
  NumberPropertyOutput,
  SelectBoxPropertyOutput,
)
export class DeviceTypeResponseDto {
  constructor(name: string, properties: PropertyOutputs[]) {
    this.name = name;
    this.properties = properties;
  }

  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(StringPropertyOutput) },
        { $ref: getSchemaPath(NumberPropertyOutput) },
        { $ref: getSchemaPath(SelectBoxPropertyOutput) },
      ],
    },
  })
  properties: PropertyOutputs[];
}
