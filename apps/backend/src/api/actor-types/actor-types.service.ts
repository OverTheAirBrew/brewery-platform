import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Device } from '../../data/entities/device.entity';
import { DeviceTypesService } from '../device-types/device-types.service';
import { Actor } from '@overtheairbrew/plugins';
import { ActorTypeSchema } from '@overtheairbrew/models';

@Injectable()
export class ActorTypesService {
  constructor(
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    private readonly deviceTypesService: DeviceTypesService,
  ) {}

  async getActorTypes(device_id: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: device_id },
    });

    if (!device) throw new Error(`Device with id ${device_id} not found`);

    const deviceType = await this.deviceTypesService.getByNameRaw(device.type);

    if (!deviceType) throw new Error(`Device type ${device.type} not found`);

    const actors = deviceType.actors;

    return await Promise.all(
      actors.map((actor) => this.mapActorType(actor, device.config)),
    );
  }

  async getByNameRaw(deviceType: string, name: string) {
    const deviceTypes = await this.deviceTypesService.getByNameRaw(deviceType);
    if (!deviceTypes) throw new Error(`Device type ${deviceType} not found`);

    const actor = deviceTypes.actors.find((actor) => actor.name === name);

    if (!actor) throw new Error(`Actor with name ${name} not found`);

    return actor;
  }

  private async mapActorType(actor: Actor<any, any>, deviceConfig: any) {
    const properties = await actor.getConfigOptions(deviceConfig);
    return ActorTypeSchema.parse({
      name: actor.name,
      properties,
    });
  }
}
