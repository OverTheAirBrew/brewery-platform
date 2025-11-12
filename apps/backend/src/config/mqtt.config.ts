import { registerAs } from '@nestjs/config';
import z from 'zod';

export const MqttSchema = z.object({
  MQTT_URL: z.string().url(),
  MQTT_PREFIX: z.string().optional(),
});

export type MqttConfigType = z.infer<typeof MqttSchema>;
