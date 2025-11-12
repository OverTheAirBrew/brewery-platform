import { cleanupOpenApiDoc } from 'nestjs-zod';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';
import { ZodFilter } from './validation/exception.handler';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { LOG_LEVELS } from '@nestjs/common';
import { ConfigType } from './config';
import { VesselsService } from './api/vessels/vessels.service';

const PORT = parseInt(process.env.PORT || '3001');

async function bootstrap() {
  const errorLogLevelIndex = LOG_LEVELS.indexOf('error');

  const levelIndex = LOG_LEVELS.indexOf(
    (process.env.LOG_LEVEL as any) || 'error',
  );

  const logLevel = LOG_LEVELS.slice(
    Math.min(levelIndex, errorLogLevelIndex),
    LOG_LEVELS.length,
  );

  const app = await NestFactory.create(AppModule, {
    logger: logLevel,
  });

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
  await app.listen(PORT);

  const vesselService = app.get(VesselsService);
  await vesselService.bootstrapVessels();
}
(async () => {
  await bootstrap();
})().catch((err) => {
  console.error('Error starting application', err);
  process.exit(1);
});
