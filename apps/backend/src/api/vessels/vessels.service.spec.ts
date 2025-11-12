import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThermalAction } from '@overtheairbrew/plugins';
import { VesselsService } from './vessels.service';
import { Mocked, TestBed } from '@suites/unit';
import {
  VesselIncorrectStateForAutoError,
  VesselNotFoundError,
} from './vessels.errors';
import { VesselProcess } from '../../internal-events/events/vessel-process';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Vessel } from '../../data/entities/vessel.entity';
import { LogicTypesService } from '../logic-types/logic-types.service';
import { ActorSensorTypesService } from '../actor-sensor-types/actor-sensor-types.service';
import { LogicTypeNotFoundError } from '../logic-types/errors/logic-type-not-found-error';

describe('VesselsService', () => {
  let service: VesselsService;

  let vesselRepository: Mocked<typeof Vessel>;
  let logicTypesService: Mocked<LogicTypesService>;
  let actorSensorTypesService: Mocked<ActorSensorTypesService>;
  let queue: Mocked<any>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(VesselsService).compile();

    service = unit;
    vesselRepository = unitRef.get<typeof Vessel>(
      REPOSITORIES.VesselRepository,
    );
    logicTypesService = unitRef.get<LogicTypesService>(LogicTypesService);
    actorSensorTypesService = unitRef.get<ActorSensorTypesService>(
      ActorSensorTypesService,
    );
    queue = unitRef.get<any>('logic-processing-queue');

    queue.sendMessage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createVessel', () => {
    it('creates a vessel without logic validation when no logic type is supplied', async () => {
      vesselRepository.create.mockResolvedValue({ id: 'vessel-1' });

      const result = await service.createVessel({
        name: 'Kettle 1',
        type: 'kettle',
      } as any);

      expect(vesselRepository.create).toHaveBeenCalledWith({
        name: 'Kettle 1',
        type: 'kettle',
      });
      expect(logicTypesService.getByNameRaw).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ id: 'vessel-1' });
    });

    it('validates logic configuration when a logic type is supplied', async () => {
      const validateConfiguration = vi.fn().mockResolvedValue(true);
      void logicTypesService.getByNameRaw.mockResolvedValue({
        validateConfiguration,
      } as any);
      vesselRepository.create.mockResolvedValue({ id: 'vessel-2' });

      const vessel = {
        name: 'Fermenter 1',
        type: 'fermenter',
        logicType_id: 'pid',
        logicConfig: { kp: 1 },
      };

      const result = await service.createVessel(vessel as any);

      expect(logicTypesService.getByNameRaw).toHaveBeenCalledWith('pid');
      expect(validateConfiguration).toHaveBeenCalledWith({ kp: 1 });
      expect(result).toStrictEqual({ id: 'vessel-2' });
    });

    it('throws if the referenced logic type cannot be found', async () => {
      void logicTypesService.getByNameRaw.mockThrow(
        new LogicTypeNotFoundError('missing'),
      );

      await expect(
        service.createVessel({ logicType_id: 'missing' } as any),
      ).rejects.toThrow('Logic type missing not found');
    });
  });

  describe('setAutoControl', () => {
    it('throws when vessel does not exist', async () => {
      void vesselRepository.findByPk.mockResolvedValue(null);

      await expect(
        service.setAutoControl('vessel-404', true),
      ).rejects.toBeInstanceOf(VesselNotFoundError);
    });

    it('throws when vessel is not configured for auto control', async () => {
      void vesselRepository.findByPk.mockResolvedValue({
        type: 'fermenter',
        logicType_id: 'pid',
        logicConfig: { kp: 1 },
        sensor_id: 'sensor-1',
        heater_id: 'heater-1',
        cooler_id: undefined,
        autoControlEnabled: false,
      });

      await expect(
        service.setAutoControl('vessel-1', true),
      ).rejects.toBeInstanceOf(VesselIncorrectStateForAutoError);
    });

    it('returns early when desired state already matches current state', async () => {
      const save = vi.fn();
      void vesselRepository.findByPk.mockResolvedValue({
        id: 'vessel-1',
        type: 'kettle',
        logicType_id: 'pid',
        logicConfig: { kp: 1 },
        sensor_id: 'sensor-1',
        heater_id: 'heater-1',
        autoControlEnabled: true,
        save,
      });

      const result = await service.setAutoControl('vessel-1', true);

      expect(result).toBeUndefined();
      expect(save).not.toHaveBeenCalled();
      expect(queue.sendMessage).not.toHaveBeenCalled();
    });

    it('disables auto control without queueing logic processing', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      void vesselRepository.findByPk.mockResolvedValue({
        id: 'vessel-1',
        type: 'kettle',
        logicType_id: 'pid',
        logicConfig: { kp: 1 },
        sensor_id: 'sensor-1',
        heater_id: 'heater-1',
        autoControlEnabled: true,
        save,
      });

      const result = await service.setAutoControl('vessel-1', false);

      expect(result).toBeUndefined();
      expect(save).toHaveBeenCalledOnce();
      expect(queue.sendMessage).not.toHaveBeenCalled();
    });

    it('enables auto control and queues a vessel process message', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      void vesselRepository.findByPk.mockResolvedValue({
        id: 'vessel-1',
        type: 'fermenter',
        logicType_id: 'pid',
        logicConfig: { kp: 1 },
        sensor_id: 'sensor-1',
        heater_id: 'heater-1',
        cooler_id: 'cooler-1',
        autoControlEnabled: false,
        save,
      });

      const result = await service.setAutoControl('vessel-1', true);

      expect(result).toStrictEqual({});
      expect(save).toHaveBeenCalledOnce();
      expect(queue.sendMessage).toHaveBeenCalledOnce();

      const [message, dedupeId] = queue.sendMessage.mock.calls[0];
      expect(dedupeId).toBe('vessel_id');
      expect(message).toBeInstanceOf(VesselProcess);
      expect(message.payload).toStrictEqual({
        vessel_id: 'vessel-1',
        logicType_id: 'pid',
        config: { kp: 1 },
      });
    });
  });

  describe('bootstrapVessels', () => {
    it('queues processing for all auto-enabled vessels', async () => {
      void vesselRepository.findAll.mockResolvedValue([
        {
          id: 'v-1',
          logicType_id: 'pid',
          logicConfig: { n: 1 },
        },
        {
          id: 'v-2',
          logicType_id: 'pid',
          logicConfig: { n: 2 },
        },
      ]);

      await service.bootstrapVessels();

      expect(vesselRepository.findAll).toHaveBeenCalledWith({
        where: { autoControlEnabled: true },
      });
      expect(queue.sendMessage).toHaveBeenCalledTimes(2);
      expect(queue.sendMessage.mock.calls[0][1]).toBe('vessel_id');
      expect(queue.sendMessage.mock.calls[1][1]).toBe('vessel_id');
    });
  });

  describe('processLogic', () => {
    it('throws when vessel does not exist', async () => {
      void logicTypesService.getByNameRaw.mockResolvedValue({ run: vi.fn() });
      void vesselRepository.findOne.mockResolvedValue(null);

      await expect(
        service.processLogic(
          new VesselProcess({
            vessel_id: 'vessel-404',
            logicType_id: 'pid',
            config: {},
          }),
        ),
      ).rejects.toBeInstanceOf(VesselNotFoundError);
    });

    it('returns early when auto control is disabled', async () => {
      const debugSpy = vi
        .spyOn((service as any).logger, 'debug')
        .mockImplementation(() => {});

      void logicTypesService.getByNameRaw.mockResolvedValue({ run: vi.fn() });
      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        autoControlEnabled: false,
      });

      await expect(
        service.processLogic(
          new VesselProcess({
            vessel_id: 'vessel-1',
            logicType_id: 'pid',
            config: {},
          }),
        ),
      ).resolves.toBeUndefined();

      expect(debugSpy).toHaveBeenCalled();
      expect(actorSensorTypesService.getRawActorType).not.toHaveBeenCalled();
    });

    it('disables auto control and throws when current telemetry is missing', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      void logicTypesService.getByNameRaw.mockResolvedValue({ run: vi.fn() });
      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        autoControlEnabled: true,
        targetTemp: 19,
        sensor: { id: 'sensor-1', telemetry: [] },
        heater: { type: 'heater-type', device: { type: 'device-type' } },
        cooler: { type: 'cooler-type', device: { type: 'device-type' } },
        save,
      });

      void actorSensorTypesService.getRawActorType
        .mockResolvedValueOnce({ on: vi.fn(), off: vi.fn() })
        .mockResolvedValueOnce({ on: vi.fn(), off: vi.fn() });

      await expect(
        service.processLogic(
          new VesselProcess({
            vessel_id: 'vessel-1',
            logicType_id: 'pid',
            config: {},
          }),
        ),
      ).rejects.toThrow('No telemetry data available for sensor sensor-1');

      expect(save).toHaveBeenCalledOnce();
    });

    it('disables auto control and throws when target temperature is missing', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      void logicTypesService.getByNameRaw.mockResolvedValue({ run: vi.fn() });
      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        autoControlEnabled: true,
        targetTemp: undefined,
        sensor: { id: 'sensor-1', telemetry: [{ value: 18.5 }] },
        heater: { type: 'heater-type', device: { type: 'device-type' } },
        cooler: { type: 'cooler-type', device: { type: 'device-type' } },
        save,
      });

      void actorSensorTypesService.getRawActorType
        .mockResolvedValueOnce({ on: vi.fn(), off: vi.fn() })
        .mockResolvedValueOnce({ on: vi.fn(), off: vi.fn() });

      await expect(
        service.processLogic(
          new VesselProcess({
            vessel_id: 'vessel-1',
            logicType_id: 'pid',
            config: {},
          }),
        ),
      ).rejects.toThrow('No target temperature set for vessel vessel-1');

      expect(save).toHaveBeenCalledOnce();
    });

    it('runs COOL action and queues next state', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(((
        cb: any,
      ) => {
        cb();
        return 0;
      }) as any);

      const logic = {
        run: vi.fn().mockResolvedValue({
          type: ThermalAction.COOL,
          actionDurationSeconds: 1,
          waitSeconds: 2,
          nextState: { step: 2 },
        }),
      };
      void logicTypesService.getByNameRaw.mockResolvedValue(logic);

      const save = vi.fn().mockResolvedValue(undefined);
      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        logicType_id: 'pid',
        autoControlEnabled: true,
        targetTemp: 19,
        sensor: { id: 'sensor-1', telemetry: [{ value: 21.2 }] },
        heater: {
          type: 'heater-type',
          config: { pin: 1 },
          device: { type: 'device-type', config: { host: 'heater-host' } },
        },
        cooler: {
          type: 'cooler-type',
          config: { pin: 2 },
          device: { type: 'device-type', config: { host: 'cooler-host' } },
        },
        save,
      });

      const heaterType = { on: vi.fn(), off: vi.fn() };
      const coolerType = { on: vi.fn(), off: vi.fn() };
      void actorSensorTypesService.getRawActorType
        .mockResolvedValueOnce(heaterType)
        .mockResolvedValueOnce(coolerType);

      await service.processLogic(
        new VesselProcess({
          vessel_id: 'vessel-1',
          logicType_id: 'pid',
          config: { step: 1 },
        }),
      );

      expect(logic.run).toHaveBeenCalledWith({ step: 1 }, 21.2, 19);
      expect(coolerType.on).toHaveBeenCalledOnce();
      expect(heaterType.on).not.toHaveBeenCalled();
      expect(heaterType.off).not.toHaveBeenCalled();
      expect(coolerType.off).not.toHaveBeenCalled();
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
      expect(queue.sendMessage).toHaveBeenCalledOnce();

      const [message, dedupeId] = queue.sendMessage.mock.calls[0];
      expect(dedupeId).toBe('vessel_id');
      expect(message).toBeInstanceOf(VesselProcess);
      expect(message.payload).toStrictEqual({
        vessel_id: 'vessel-1',
        logicType_id: 'pid',
        config: { step: 2 },
      });
    });

    it('runs HEAT action', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementation(((cb: any) => {
        cb();
        return 0;
      }) as any);

      const logic = {
        run: vi.fn().mockResolvedValue({
          type: ThermalAction.HEAT,
          actionDurationSeconds: 0,
          waitSeconds: 0,
          nextState: { step: 3 },
        }),
      };
      void logicTypesService.getByNameRaw.mockResolvedValue(logic);

      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        logicType_id: 'pid',
        autoControlEnabled: true,
        targetTemp: 19,
        sensor: { id: 'sensor-1', telemetry: [{ value: 18 }] },
        heater: {
          type: 'heater-type',
          config: { pin: 1 },
          device: { type: 'device-type', config: { host: 'heater-host' } },
        },
        cooler: {
          type: 'cooler-type',
          config: { pin: 2 },
          device: { type: 'device-type', config: { host: 'cooler-host' } },
        },
        save: vi.fn().mockResolvedValue(undefined),
      });

      const heaterType = { on: vi.fn(), off: vi.fn() };
      const coolerType = { on: vi.fn(), off: vi.fn() };
      void actorSensorTypesService.getRawActorType
        .mockResolvedValueOnce(heaterType)
        .mockResolvedValueOnce(coolerType);

      await service.processLogic(
        new VesselProcess({
          vessel_id: 'vessel-1',
          logicType_id: 'pid',
          config: { step: 2 },
        }),
      );

      expect(heaterType.on).toHaveBeenCalledOnce();
      expect(coolerType.on).not.toHaveBeenCalled();
      expect(heaterType.off).not.toHaveBeenCalled();
      expect(coolerType.off).not.toHaveBeenCalled();
    });

    it('runs IDLE action by turning both heater and cooler off', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementation(((cb: any) => {
        cb();
        return 0;
      }) as any);

      const logic = {
        run: vi.fn().mockResolvedValue({
          type: ThermalAction.IDLE,
          actionDurationSeconds: 0,
          waitSeconds: 0,
          nextState: { step: 4 },
        }),
      };
      void logicTypesService.getByNameRaw.mockResolvedValue(logic);

      void vesselRepository.findOne.mockResolvedValue({
        id: 'vessel-1',
        logicType_id: 'pid',
        autoControlEnabled: true,
        targetTemp: 19,
        sensor: { id: 'sensor-1', telemetry: [{ value: 19 }] },
        heater: {
          type: 'heater-type',
          config: { pin: 1 },
          device: { type: 'device-type', config: { host: 'heater-host' } },
        },
        cooler: {
          type: 'cooler-type',
          config: { pin: 2 },
          device: { type: 'device-type', config: { host: 'cooler-host' } },
        },
        save: vi.fn().mockResolvedValue(undefined),
      });

      const heaterType = {
        on: vi.fn(),
        off: vi.fn().mockResolvedValue(undefined),
      };
      const coolerType = {
        on: vi.fn(),
        off: vi.fn().mockResolvedValue(undefined),
      };
      void actorSensorTypesService.getRawActorType
        .mockResolvedValueOnce(heaterType)
        .mockResolvedValueOnce(coolerType);

      await service.processLogic(
        new VesselProcess({
          vessel_id: 'vessel-1',
          logicType_id: 'pid',
          config: { step: 3 },
        }),
      );

      expect(heaterType.on).not.toHaveBeenCalled();
      expect(coolerType.on).not.toHaveBeenCalled();
      expect(heaterType.off).toHaveBeenCalledOnce();
      expect(coolerType.off).toHaveBeenCalledOnce();
    });
  });
});
