import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';
import { ZodFilter } from './validation/exception.handler';

const PORT = parseInt(process.env.PORT || '3001');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalFilters(new ZodFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document));
  await app.listen(PORT);
}
bootstrap();
