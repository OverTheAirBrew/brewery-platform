import { ModelCtor } from 'sequelize-typescript';
import { ApiKey } from './entities/api-key.entity';
import { Device } from './entities/device.entity';
import { Sensor } from './entities/sensor.entity';

import { Telemetry } from './entities/telemetry.entity';
import { Vessel } from './entities/vessel.entity';
import { Actor } from './entities/actor.entity';

export const REPOSITORIES = {
  ApiKeyRepository: Symbol('API_KEY_REPOSITORY'),
  DeviceRepository: Symbol('DEVICE_REPOSITORY'),
  SensorRepository: Symbol('SENSOR_REPOSITORY'),
  TelemetryRepository: Symbol('TELEMETRY_REPOSITORY'),
  VesselRepository: Symbol('VESSEL_REPOSITORY'),
  ActorRepository: Symbol('ACTOR_REPOSITORY'),
};

type ValueOf<T> = T[keyof T];

export const REPOSITORY_ENTITIES: {
  provide: ValueOf<typeof REPOSITORIES>;
  useValue: ModelCtor;
}[] = [
  {
    provide: REPOSITORIES.ApiKeyRepository,
    useValue: ApiKey,
  },
  {
    provide: REPOSITORIES.DeviceRepository,
    useValue: Device,
  },
  {
    provide: REPOSITORIES.SensorRepository,
    useValue: Sensor,
  },
  {
    provide: REPOSITORIES.TelemetryRepository,
    useValue: Telemetry,
  },
  {
    provide: REPOSITORIES.VesselRepository,
    useValue: Vessel,
  },
  {
    provide: REPOSITORIES.ActorRepository,
    useValue: Actor,
  },
];
