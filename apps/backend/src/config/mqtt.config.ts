import { registerAs } from '@nestjs/config';
import z from 'zod';

export const MqttSchema = z.object({
  MQTT_URL: z.string().url(),
});

export type MqttConfigType = z.infer<typeof MqttSchema>;
