import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@wahyubucil/nestjs-zod-openapi';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';
import { ZodFilter } from './validation/exception.handler';

const PORT = parseInt(process.env.PORT || '3001');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalFilters(new ZodFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  patchNestjsSwagger({ schemasSort: 'alpha' });

  SwaggerModule.setup('docs', app, document);
  await app.listen(PORT);
}
bootstrap();
