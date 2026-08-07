import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Actor } from '../../data/entities/actor.entity';
import { Device } from '../../data/entities/device.entity';
import { ActorDto } from '@overtheairbrew/models';
import { DeviceTypesService } from '../device-types/device-types.service';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';
import { DeviceNotFoundError } from '../devices/errors/device-not-found-error';

@Injectable()
export class ActorsService {
  constructor(
    private readonly actorSensorTypesService: ActorSensorTypesService,
    @Inject(REPOSITORIES.ActorRepository)
    private readonly actorRepository: typeof Actor,
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    private readonly deviceTypesService: DeviceTypesService,
  ) {}

  async createActor(actor: ActorDto) {
    const device = await this.deviceRepository.findByPk(actor.device_id, {
      attributes: ['type', 'config'],
      include: [
        {
          model: Actor,
          as: 'actors',
          attributes: ['id'],
        },
      ],
    });

    if (!device) {
      throw new DeviceNotFoundError(actor.device_id);
    }

    const deviceType = await this.deviceTypesService.getByNameRaw(device.type);

    const actorType = await this.actorSensorTypesService.getRawActorType(
      device.type,
      actor.type,
    );

    await actorType.validateConfiguration(device.config, actor.config);

    if (deviceType.validateActorCount(device.actors?.length || 0)) {
      throw new BadRequestException(
        `Maximum number of actors exceeded for device type ${device.type}`,
      );
    }

    const { id } = await this.actorRepository.create({
      ...actor,
    });

    return {
      id,
    };
  }
}
