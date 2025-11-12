// This file is auto-generated. Do not edit manually.

import z from 'zod';
import { MqttMessage } from '@overtheairbrew/mqtt';

export const FtssDeviceSwitchActorSchema = z.object({
  actor_id: z.string(),
  device_id: z.string(),
  state: z.enum(['on', 'off']),
});

export type FtssDeviceSwitchActorType = z.infer<
  typeof FtssDeviceSwitchActorSchema
>;

export class FtssDeviceSwitchActor extends MqttMessage<FtssDeviceSwitchActorType> {
  protected topic = (payload: FtssDeviceSwitchActorType) =>
    `ftss/${payload.device_id}/actor/switch`;

  constructor(data: FtssDeviceSwitchActorType) {
    super(data);
  }
}
