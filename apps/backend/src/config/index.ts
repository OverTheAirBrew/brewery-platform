import z from 'zod';
import { ConfigSchema } from './global.config';
import { DatabaseSchema } from './data.config';
import { MqttSchema } from './mqtt.config';
import { registerAs } from '@nestjs/config';
import { RedisSchema } from './redis.config';

const config = z.object({
  global: ConfigSchema,
  database: DatabaseSchema,
  mqtt: MqttSchema,
  redis: RedisSchema,
  privateKey: z.string(),
});

const fullConfig = () =>
  config.parse({
    global: ConfigSchema.parse(process.env),
    database: DatabaseSchema.parse(process.env),
    mqtt: MqttSchema.parse(process.env),
    redis: RedisSchema.parse(process.env),
    privateKey: z.string().parse(process.env.PRIVATE_KEY),
  });

export type ConfigType = z.infer<typeof config>;
export type DatabaseType = z.infer<typeof DatabaseSchema>;

export default registerAs<ConfigType>('CONFIG', () => fullConfig());
