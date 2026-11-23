import { Global, Injectable } from '@nestjs/common';
import { JSONSchema7 } from 'json-schema';

@Injectable()
export class JsonSchemaGeneratorService {
  async generateSchema(
    title: string,
    description: string,
    properties: JSONSchema7['properties'],
    extra: {
      anyOf?: JSONSchema7[];
    },
  ): Promise<JSONSchema7> {
    const anyOfSchemas = extra.anyOf || [];

    return {
      title,
      description,
      type: 'object',
      properties,
      anyOf: anyOfSchemas,
    };
  }

  async generateIfSchema(
    ifSchema: JSONSchema7['if'],
    thenSchema: JSONSchema7['then'],
  ): Promise<JSONSchema7> {
    return {
      if: ifSchema,
      then: thenSchema,
    };
  }
}
