export type SchemaConfig = {
  $schema: string;
  title: string;
  type: 'object';
  properties: Record<string, any>;
  required: string[];
  topic: string;
};
