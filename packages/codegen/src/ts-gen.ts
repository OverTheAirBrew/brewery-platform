import { SchemaConfig } from './abstractions';

const zodMappings = (enums?: string[]): Record<string, string> => ({
  string: 'z.string()',
  number: 'z.number()',
  enum: enums
    ? `z.enum([${enums.map((e) => `'${e}'`).join(', ')}])`
    : 'z.any()',
});

const HEADING = `// This file is auto-generated. Do not edit manually.

import z from 'zod';
import { MqttMessage } from '@overtheairbrew/mqtt';
`;

const SCHEMA = (
  schema: SchemaConfig,
) => `export const ${schema.title}Schema = z.object({
  ${Object.entries(schema.properties)
    .map(([key, value]) => {
      const isRequired = schema.required.includes(key);
      const type =
        zodMappings(value.enum)[value.enum ? 'enum' : value.type] || 'z.any()';
      return `${key}: ${type}${isRequired ? '' : '.optional()'},`;
    })
    .join('\n')}
});

export type ${schema.title}Type = z.infer<typeof ${schema.title}Schema>
`;

const CLASS = (
  schema: SchemaConfig,
) => `export class ${schema.title} extends MqttMessage<${schema.title}Type> {
  protected topic = (payload: ${schema.title}Type) => \`${schema.topic.replace(/\{([^}]+)\}/g, '${payload.$1}')}\`;

  constructor(data: ${schema.title}Type) {
    super(data);
  }
}
`;

export const generateTypescriptFiles = (
  schemas: SchemaConfig[],
): Record<string, string> => {
  const output: Record<string, string> = {};

  for (const schema of schemas) {
    if (schema.type !== 'object') {
      console.log(
        `[codegen] Warning: Schema ${schema.title} has type ${schema.type}, expected 'object'. Skipping.`,
      );
      continue;
    }

    const parts: string[] = [HEADING, SCHEMA(schema), CLASS(schema)];
    output[schema.title] = parts.join('\n');
  }

  return output;
};
