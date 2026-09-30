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
import { globalConfig } from 'zod/v4/core';
import { globalConfigure } from './global-configure';

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

  await globalConfigure(app);

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
