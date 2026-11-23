import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceTypesService } from '../device-types/device-types.service';
import {
  DeviceDto,
  SingleUseCodeExchangeResponse,
} from '@overtheairbrew/models';
import { REPOSITORIES } from '../../data/data.abstractions';
import { Device } from '../../data/entities/device.entity';
import { CommunicationType, MqttDevice } from '@overtheairbrew/plugins';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { AddMqttUserMessage } from '../../mqtt-client/events/add-mqtt-user.message';
import { randomBytes, randomFillSync } from 'crypto';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { JsonSchemaGeneratorService } from '../../json-schema-generator/json-schema-generator.service';
import { SingleUseCodes } from '../../data/entities/single-use-code.entity';
import { InvalidCodeError } from './errors/invalid-code-error';
import { CodeExpiredError } from './errors/code-expired-error';
import { CodeDeviceNotFoundError } from './errors/code-device-not-found';
import { ConfigType } from '../../config';
import { DeviceNotFoundError } from './errors/device-not-found-error';

/* istanbul ignore start */
@Injectable()
export class DeviceService {
  /* istanbul ignore stop */
  constructor(
    private deviceTypeService: DeviceTypesService,
    @Inject(REPOSITORIES.DeviceRepository)
    private readonly deviceRepository: typeof Device,
    @Inject(REPOSITORIES.SingleUseCodesRepository)
    private readonly singleUseCodesRepository: typeof SingleUseCodes,
    private readonly mqttClient: MqttService,
    private readonly jsonSchemaGeneratorService: JsonSchemaGeneratorService,
    private readonly configService: ConfigService,
  ) {}

  async createDevice(deviceDto: DeviceDto) {
    const deviceType = await this.deviceTypeService.getByNameRaw(
      deviceDto.type,
    );

    await deviceType.validateConfiguration(deviceDto.config);

    const transaction = await this.deviceRepository.sequelize?.transaction();

    let device: Device | null = null;
    let code: SingleUseCodes | null = null;

    try {
      device = await this.deviceRepository.create(
        {
          ...deviceDto,
          type: deviceType.name,
        },
        {
          transaction,
        },
      );

      if (deviceType.connectionType === CommunicationType.MQTT) {
        code = await this.singleUseCodesRepository.create(
          {
            device_id: device.id,
            code: this.generateSecureCode(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 minutes
          },
          {
            transaction,
          },
        );
      }

      await transaction?.commit();
    } catch (err) {
      await transaction?.rollback();
      throw err;
    }

    return {
      id: device.id,
      code: code?.code,
    };
  }

  public async refreshCode(deviceId: string) {
    const device = await this.deviceRepository.findByPk(deviceId);
    if (!device) {
      throw new DeviceNotFoundError(deviceId);
    }

    const transaction =
      await this.singleUseCodesRepository.sequelize?.transaction();

    let code: SingleUseCodes | null = null;

    try {
      await this.singleUseCodesRepository.destroy({
        where: {
          device_id: device.id,
        },
        transaction,
      });

      code = await this.singleUseCodesRepository.create(
        {
          device_id: device.id,
          code: this.generateSecureCode(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 minutes
        },
        {
          transaction,
        },
      );

      await transaction?.commit();
    } catch (err) {
      await transaction?.rollback();
      throw err;
    }

    return {
      id: device.id,
      code: code.code,
    };
  }

  public async exchangeSingleUseCode(code: string) {
    const singleUseCode = await this.singleUseCodesRepository.findOne({
      where: {
        code,
      },
      include: [Device],
    });

    if (!singleUseCode) {
      throw new InvalidCodeError();
    }

    if (!singleUseCode.device) {
      throw new CodeDeviceNotFoundError();
    }

    if (singleUseCode.expiresAt < new Date()) {
      throw new CodeExpiredError();
    }

    const deviceType = await this.deviceTypeService.getByNameRaw(
      singleUseCode.device.type,
    );

    const config = this.configService.get<ConfigType>('CONFIG');
    const { hostname, port, protocol } = new URL(config?.mqtt.MQTT_URL!);

    let mqttPassword: string | undefined = undefined;

    mqttPassword = this.generatePassword();

    const { publishTopics, subscribeTopics } = (
      deviceType as MqttDevice<any>
    ).getTopics(singleUseCode.device);

    this.mqttClient.sendMessage(
      new AddMqttUserMessage({
        username: singleUseCode.device.id,
        password: mqttPassword,
        authorizeSubscribe: subscribeTopics,
        authorizePublish: [...publishTopics, 'platform/test-connection'],
      }),
    );

    const transaction =
      await this.singleUseCodesRepository.sequelize?.transaction();

    try {
      await this.singleUseCodesRepository.destroy({
        where: {
          id: singleUseCode.id,
        },
        transaction,
      });

      const response = SingleUseCodeExchangeResponse.parse({
        version: 1,
        deviceId: singleUseCode.device.id,
        mqtt: {
          host: hostname,
          port: parseInt(port),
          tls: protocol === 'mqtts:',
          password: mqttPassword,
        },
      });
      await transaction?.commit();

      return response;
    } catch (err) {
      await transaction?.rollback();
      throw err;
    }
  }

  private async testing(key: 'sensors' | 'actors') {
    const types: string[] = [];
    const anyOf: JSONSchema7[] = [];

    const devices = await this.deviceRepository.findAll();

    for (const device of devices) {
      const deviceType = await this.deviceTypeService.getByNameRaw(device.type);
      for (const type of deviceType[key]) {
        if (!types.includes(type.name)) {
          types.push(type.name);

          const properties = await type.getConfigOptions(device.config);

          anyOf.push({
            if: {
              properties: {
                type: {
                  const: type.name,
                },
              },
            },
            then: properties,
          } satisfies JSONSchema7Definition);
        }
      }
    }

    return {
      types,
      anyOf,
    };
  }

  async getAllSensorTypes() {
    const { types: sensorTypes, anyOf } = await this.testing('sensors');

    return this.jsonSchemaGeneratorService.generateSchema(
      'Create new sensor',
      '',
      {
        name: {
          type: 'string',
          title: 'Sensor Name',
        },
        type: {
          type: 'string',
          title: 'Sensor Type',
          enum: sensorTypes,
        },
      },
      {
        anyOf,
      },
    );
  }

  async getAllActorTypes() {
    const { types: actorTypes, anyOf } = await this.testing('actors');

    return this.jsonSchemaGeneratorService.generateSchema(
      'Create new actor',
      '',
      {
        name: {
          type: 'string',
          title: 'Actor Name',
        },
        type: {
          type: 'string',
          title: 'Actor Type',
          enum: actorTypes,
        },
      },
      {
        anyOf,
      },
    );
  }

  async getByIds(ids: string[]) {
    const devices = await this.deviceRepository.findAll({
      where: {
        id: ids,
      },
    });

    return devices;
  }

  private generatePassword(
    length = 20,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$',
  ): string {
    return Array.from(randomFillSync(new Uint32Array(length)))
      .map((x) => characters[x % characters.length])
      .join('');
  }

  private generateSecureCode() {
    const buffer = randomBytes(4);
    const number = buffer.readUInt32BE(0) % 100000000;
    const paddedString = number.toString().padStart(8, '0');
    return `${paddedString.slice(0, 4)}-${paddedString.slice(4)}`;
  }
}
