import { PropertySchema, SchemaConfig } from './abstractions';

const PY_TYPES: Record<string, string> = {
  string: 'str',
  number: 'float',
  integer: 'int',
  boolean: 'bool',
  object: 'dict',
  array: 'list',
};

const pyType = (prop: PropertySchema) => {
  if (prop.enum) return 'str';
  return PY_TYPES[prop.type ?? ''] ?? 'object';
};

const toSnakeCase = (str: string) =>
  str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');

const generateClass = (schema: SchemaConfig) => {
  const { title, properties = {}, required = [] } = schema;
  const requiredSet = new Set(required);
  const keys = Object.keys(properties);

  const slots = keys.map((key) => `"${key}"`).join(', ');

  const initParams = Object.entries(properties)
    .map(([key, prop]) => {
      const isRequired = requiredSet.has(key);
      const type = pyType(prop);
      return `${key}${isRequired ? '' : '?'}: ${type}`;
    })
    .join(', ');

  const assignments = keys
    .map((key) => `      self.${key} = ${key};`)
    .join('\n');

  return [
    `class ${title}:`,
    `    __slots__ = [${slots}]`,
    ``,
    `    def __init__(self, ${initParams}):`,
    assignments,
    ``,
    generateFromDict(schema),
  ].join('\n');
};

const generateFromDict = (schema: SchemaConfig) => {
  const { title, properties = {}, required = [] } = schema;
  const requiredSet = new Set(required);
  const lines: string[] = [
    `    @classmethod`,
    `    def from_dict(cls, data: dict) -> "${title}":`,
  ];

  if (required.length > 0) {
    const keyList = required.map((key) => `"${key}"`).join(', ');
    lines.push(
      `       missing_keys = [key for key in (${keyList}) if key not in data]`,
    );
    lines.push(`       if missing_keys:`);
    lines.push(
      `           raise ValueError(f"Missing required keys: {', '.join(missing_keys)}")`,
    );
  }

  lines.push(``);
  lines.push(`       return cls(`);

  for (const [name, prop] of Object.entries(properties)) {
    const typ = pyType(prop);
    if (requiredSet.has(name)) {
      lines.push(`           ${name}=${typ}(data["${name}"]),`);
    } else {
      lines.push(
        `           ${name}=${typ}(data.get("${name}")) if "${name}" in data else None,`,
      );
    }
  }
  lines.push(`       )`);

  return lines.join('\n');
};

export const generatePythonFiles = (schemas: SchemaConfig[], today: string) => {
  const files: Record<string, string> = {};

  const fileHeader = [
    `# AUTO_GENERATED - do not edit by hand.`,
    `# Generated ${today}`,
    ``,
    ``,
  ].join('\n');

  for (const schema of schemas) {
    if (schema.type !== 'object')
      console.log(
        `[codegen] Warning: Schema ${schema.title} has type ${schema.type}, expected 'object'. Skipping.`,
      );

    files[toSnakeCase(schema.title)] =
      fileHeader + generateClass(schema) + '\n';
  }

  files['__init__'] = [
    `# AUTO_GENERATED - do not edit by hand.`,
    `# Generated ${today}`,
    ``,
    ...schemas.map((s) => `from .${toSnakeCase(s.title)} import ${s.title}`),
    ``,
  ].join('\n');

  return files;
};
