import { PropertySchema, SchemaConfig } from './abstractions';

const ZOD_TYPES: Record<string, string> = {
  string: 'z.string()',
  number: 'z.number()',
  boolean: 'z.boolean()',
  object: 'z.object(z.unknown())',
  array: 'z.array(z.unknown())',
};

const zodType = (prop: PropertySchema) => {
  if (prop.enum)
    return `z.enum([${prop.enum.map((e) => `'${e}'`).join(', ')}])`;
  return ZOD_TYPES[prop.type || ''] || 'z.unknown()';
};

const generateZodObject = (schema: SchemaConfig) => {
  const required = new Set(schema.required);
  const fields = Object.entries(schema.properties || {})
    .map(([key, prop]) => {
      const type = zodType(prop);
      return `  ${key}: ${required.has(key) ? type : `${type}.optional()`}`;
    })
    .join(',\n');

  return `z.object({\n${fields},\n}).strict()`;
};

const generateMessageBlock = (schema: SchemaConfig) => {
  const schemaName = `${schema.title}PayloadSchema`;
  const typeName = `${schema.title}Payload`;
  const topicExpr = schema.topic.replace(/\{([^}]+)\}/g, '${payload.$1}');

  return [
    ``,
    ``,
    `export const ${schemaName} = ${generateZodObject(schema)};`,
    ``,
    `export type ${typeName} = z.infer<typeof ${schemaName}>;`,
    ``,
    `export class ${schema.title} extends MqttMessage<${typeName}> {`,
    `  protected topic = (payload: ${typeName}) => \`${topicExpr}\`;`,
    `}`,
  ].join('\n');
};

const toKebabCase = (str: string) =>
  str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

export const generateTypescriptFiles = (
  schemas: SchemaConfig[],
  generatedDate: string,
): Record<string, string> => {
  const output: Record<string, string> = {};

  for (const schema of schemas) {
    if (schema.type !== 'object') {
      console.log(
        `[codegen] Warning: Schema ${schema.title} has type ${schema.type}, expected 'object'. Skipping.`,
      );
      continue;
    }

    const fileHeader = [
      `// AUTO_GENERATED - do not edit by hand.`,
      `// Generated ${generatedDate}`,
      ``,
      `import z from 'zod';`,
      `import { MqttMessage } from '@overtheairbrew/mqtt';`,
    ].join('\n');

    for (const schema of schemas) {
      if (output[toKebabCase(schema.title)]) {
        console.log(
          `[codegen] Warning: Duplicate schema title ${schema.title}. Skipping.`,
        );
        continue;
      }

      output[toKebabCase(schema.title)] =
        fileHeader + generateMessageBlock(schema) + '\n';
    }

    output['index'] = [
      `// AUTO_GENERATED - do not edit by hand.`,
      `// Generated ${generatedDate}`,
      ``,
      ...schemas.map((s) => `export * from './${toKebabCase(s.title)}';`),
      ``,
    ].join('\n');
  }

  return output;
};
