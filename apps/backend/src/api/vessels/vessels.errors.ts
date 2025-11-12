import { BadRequestException, NotFoundException } from '@nestjs/common';

export class VesselIncorrectStateForAutoError extends BadRequestException {
  constructor(vessel_id: string) {
    super(
      `Vessel with id ${vessel_id} is not properly configured for auto control`,
    );
  }
}

export class VesselNotFoundError extends NotFoundException {
  constructor(vessel_id: string) {
    super(`Vessel with id ${vessel_id} not found`);
  }
}
