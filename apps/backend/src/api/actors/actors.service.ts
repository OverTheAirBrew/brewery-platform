import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Actor } from '../../data/entities/actor.entity';
import { Device } from '../../data/entities/device.entity';
import { ActorDto } from '@overtheairbrew/models';
import { DeviceTypesService } from '../device-types/device-types.service';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';
import { DeviceNotFoundError } from '../devices/errors/device-not-found-error';
import { MaximumActorsForDeviceError } from './errors/maximum-actors-for-device-error';
import { CommunicationType } from '@overtheairbrew/plugins';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { UpdateAuthorizePublishSubscribe } from '../../mqtt-client/events/update-mqtt-user-authorize-publish-subscribe';

/* istanbul ignore start */
@Injectable()
export class ActorsService {
  /* istanbul ignore stop */
  constructor(
    private readonly actorSensorTypesService: ActorSensorTypesService,
    @Inject(REPOSITORIES.ActorRepository)
    private readonly actorRepository: typeof Actor,
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    private readonly deviceTypesService: DeviceTypesService,
    private readonly mqttClient: MqttService,
  ) {}

  async createActor(actor: ActorDto) {
    const device = await this.deviceRepository.findByPk(actor.device_id, {
      attributes: ['id', 'type', 'config'],
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
      throw new MaximumActorsForDeviceError(device.type);
    }

    const { id } = await this.actorRepository.create({
      ...actor,
    });

    if (actorType.communicationType === CommunicationType.MQTT) {
      const { publishTopics, subscribeTopics } = (actorType as any).getTopics({
        device,
        actor,
      });

      this.mqttClient.sendMessage(
        new UpdateAuthorizePublishSubscribe({
          username: device.id,
          authorizePublish: publishTopics,
          authorizeSubscribe: subscribeTopics,
        }),
      );
    }

    return {
      id,
    };
  }
}
