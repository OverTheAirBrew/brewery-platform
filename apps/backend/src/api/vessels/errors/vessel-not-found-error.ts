import { NotFoundException } from '@nestjs/common';

export class VesselNotFoundError extends NotFoundException {
  constructor(vesselId: string) {
    super(`Vessel with ID ${vesselId} not found`);
  }
}
