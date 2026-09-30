import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ZodFilter } from './validation/exception.handler';
import { swaggerConfig } from './swagger-config';
import { SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export const globalConfigure = async (app: INestApplication<any>) => {
  const configService = app.get<ConfigService>(ConfigService);
  const config = configService.get<ConfigType>('CONFIG');

  const mqttUrl = new URL(config!.mqtt.MQTT_URL);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: `${mqttUrl.protocol}//${mqttUrl.hostname}`,
      port: parseInt(mqttUrl.port) || 1883,
      username: mqttUrl.username,
      password: mqttUrl.password,
    },
  });

  app.enableCors();
  app.useGlobalFilters(new ZodFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document));

  await app.startAllMicroservices();
};
