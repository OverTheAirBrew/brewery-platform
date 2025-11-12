import z from 'zod';
import { ConfigSchema } from './global.config';
import { DatabaseSchema } from './data.config';
import { MqttSchema } from './mqtt.config';
import { registerAs } from '@nestjs/config';

const config = z.object({
  global: ConfigSchema,
  database: DatabaseSchema,
  mqtt: MqttSchema,
});

const fullConfig = () =>
  config.parse({
    global: ConfigSchema.parse(process.env),
    database: DatabaseSchema.parse(process.env),
    mqtt: MqttSchema.parse(process.env),
  });

export type ConfigType = z.infer<typeof config>;

export default registerAs<ConfigType>('CONFIG', () => fullConfig());
