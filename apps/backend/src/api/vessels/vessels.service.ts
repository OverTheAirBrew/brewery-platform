import { Inject, Injectable, Logger } from '@nestjs/common';
import { VesselDto } from '@overtheairbrew/models';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Vessel } from '../../data/entities/vessel.entity';
import { LogicTypesService } from '../logic-types/logic-types.service';
import { VesselProcess } from '../../internal-events/events/vessel-process';
import {
  VesselIncorrectStateForAutoError,
  VesselNotFoundError,
} from './vessels.errors';
import { Actor } from '../../data/entities/actor.entity';
import { Device } from '../../data/entities/device.entity';
import { ThermalAction } from '@overtheairbrew/plugins';
import { Sensor } from '../../data/entities/sensor.entity';
import { Telemetry } from '../../data/entities/telemetry.entity';
import { CustomQueue } from '../../internal-events/internal-events.service';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';

@Injectable()
export class VesselsService {
  private readonly logger: Logger;

  constructor(
    @Inject(REPOSITORIES.VesselRepository)
    private readonly vesselRepository: typeof Vessel,
    private readonly logicTypesService: LogicTypesService,
    private readonly actorSensorTypesService: ActorSensorTypesService,
    @Inject('logic-processing-queue') private readonly queue: CustomQueue,
  ) {
    this.logger = new Logger(VesselsService.name);
  }

  async createVessel(vessel: VesselDto) {
    if (vessel.logicType_id) {
      const logicType = await this.logicTypesService.getByNameRaw(
        vessel.logicType_id,
      );
      if (!logicType) {
        throw new Error(`Logic type ${vessel.logicType_id} not found`);
      }
      await logicType.validateConfiguration(vessel.logicConfig);
    }

    const createdVessel = await this.vesselRepository.create({
      ...vessel,
    });

    return {
      id: createdVessel.id,
    };
  }

  async setAutoControl(vessel_id: string, autoControlEnabled: boolean) {
    const vessel = await this.vesselRepository.findByPk(vessel_id);
    if (!vessel) {
      throw new VesselNotFoundError(vessel_id);
    }

    if (
      !vessel.logicType_id ||
      !vessel.logicConfig ||
      !vessel.sensor_id ||
      !vessel.heater_id ||
      (vessel.type === 'fermenter' && !vessel.cooler_id)
    ) {
      throw new VesselIncorrectStateForAutoError(vessel_id);
    }

    if (vessel.autoControlEnabled === autoControlEnabled) {
      return;
    }

    vessel.autoControlEnabled = autoControlEnabled;
    await vessel.save();

    if (!autoControlEnabled) {
      return;
    }

    await this.queue.sendMessage(
      new VesselProcess({
        vessel_id: vessel.id,
        logicType_id: vessel.logicType_id,
        config: vessel.logicConfig,
      }),
      'vessel_id',
    );

    return {};
  }

  async bootstrapVessels() {
    const vessels = await this.vesselRepository.findAll({
      where: { autoControlEnabled: true },
    });

    for (const vessel of vessels) {
      await this.queue.sendMessage(
        new VesselProcess({
          vessel_id: vessel.id,
          logicType_id: vessel.logicType_id!,
          config: vessel.logicConfig,
        }),
        'vessel_id',
      );
    }
  }

  async processLogic(message: VesselProcess) {
    const [logic, vessel] = await Promise.all([
      this.logicTypesService.getByNameRaw(message.payload.logicType_id),
      this.vesselRepository.findOne({
        where: { id: message.payload.vessel_id },
        include: [
          {
            model: Actor,
            as: 'heater',
            attributes: ['type', 'config'],
            include: [
              { model: Device, as: 'device', attributes: ['type', 'config'] },
            ],
          },
          {
            model: Actor,
            as: 'cooler',
            attributes: ['type', 'config'],
            include: [
              { model: Device, as: 'device', attributes: ['type', 'config'] },
            ],
          },
          {
            model: Sensor,
            as: 'sensor',
            attributes: ['id'],
            include: [
              {
                model: Telemetry,
                as: 'telemetry',
                attributes: ['value'],
                limit: 1,
                order: [['createdAt', 'DESC']],
              },
            ],
          },
        ],
      }),
    ]);

    if (!vessel) {
      throw new VesselNotFoundError(message.payload.vessel_id);
    }

    if (!vessel.autoControlEnabled) {
      this.logger.debug(
        `Auto control for vessel ${vessel.id} is disabled, skipping logic processing`,
      );
      return;
    }

    const { heater, cooler } = vessel;

    const [heaterType, coolerType] = await Promise.all([
      this.actorSensorTypesService.getRawActorType(
        heater!.device!.type,
        heater!.type,
      ),
      this.actorSensorTypesService.getRawActorType(
        cooler!.device!.type,
        cooler!.type,
      ),
    ]);

    const currentTemp = vessel.sensor?.telemetry?.[0]?.value;
    const targetTemp = vessel.targetTemp;

    if (!currentTemp) {
      vessel.autoControlEnabled = false;
      await vessel.save();

      throw new Error(
        `No telemetry data available for sensor ${vessel.sensor?.id}`,
      );
    }

    if (!targetTemp) {
      vessel.autoControlEnabled = false;
      await vessel.save();

      throw new Error(`No target temperature set for vessel ${vessel.id}`);
    }

    const response = await logic.run(
      message.payload.config,
      currentTemp,
      targetTemp,
    );

    if (response.type === ThermalAction.COOL) {
      await coolerType.on({
        actor: cooler?.config,
        device: cooler?.device?.config,
      });
    } else if (response.type === ThermalAction.HEAT) {
      await heaterType.on({
        actor: heater?.config,
        device: heater?.device?.config,
      });
    } else {
      await Promise.all([
        heaterType.off({
          actor: heater?.config,
          device: heater?.device?.config,
        }),
        coolerType.off({
          actor: cooler?.config,
          device: cooler?.device?.config,
        }),
      ]);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, response.actionDurationSeconds * 1000),
    );

    await new Promise((resolve) =>
      setTimeout(resolve, response.waitSeconds * 1000),
    );

    await this.queue.sendMessage(
      new VesselProcess({
        vessel_id: vessel.id,
        logicType_id: vessel.logicType_id!,
        config: response.nextState,
      }),
      'vessel_id',
    );
  }
}
