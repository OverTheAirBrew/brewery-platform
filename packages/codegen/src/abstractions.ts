export type PropertySchema = {
  type?: string;
  description?: string;
  enum?: string[];
};

export type SchemaConfig = {
  $schema: string;
  title: string;
  type: 'object';
  properties: Record<string, PropertySchema>;
  required: string[];
  topic: string;
};
