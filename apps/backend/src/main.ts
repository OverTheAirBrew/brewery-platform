import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';

const PORT = parseInt(process.env.PORT || '3001');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup('docs', app, document)

  await app.listen(PORT);
}
bootstrap();
