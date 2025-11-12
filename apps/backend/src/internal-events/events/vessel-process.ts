import { InternalEventMessage } from '../internal-events.service';

export type VesselProcessPayload = {
  vessel_id: string;

  logicType_id: string;
  config: any;
};

export class VesselProcess extends InternalEventMessage<VesselProcessPayload> {
  public readonly topic = 'vessel.process';

  constructor(payload: VesselProcessPayload) {
    super(payload);
  }
}
