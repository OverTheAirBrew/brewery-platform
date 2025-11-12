import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ActorTypesService } from '../actor-types/actor-types.service';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Actor } from '../../data/entities/actor.entity';
import { Device } from '../../data/entities/device.entity';
import { ActorDto } from '@overtheairbrew/models';
import { DeviceTypesService } from '../device-types/device-types.service';

@Injectable()
export class ActorsService {
  constructor(
    private readonly actorTypesService: ActorTypesService,
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
      throw new Error(`Device with ID ${actor.device_id} not found`);
    }

    const deviceType = await this.deviceTypesService.getByNameRaw(device.type);

    if (!deviceType) {
      throw new BadRequestException(`Device type ${device.type} not found`);
    }

    const actorType = await this.actorTypesService.getByNameRaw(
      device.type,
      actor.type,
    );

    if (!actorType) {
      throw new Error(
        `Actor type ${actor.type} not found for device type ${device.type}`,
      );
    }

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
