import { NotFoundException } from '@nestjs/common';

export class ActorTypeNotFoundError extends NotFoundException {
  constructor(deviceTypeId: string, actorTypeId: string) {
    super(
      `Actor type ${actorTypeId} not found for device type ${deviceTypeId}`,
    );
  }
}
