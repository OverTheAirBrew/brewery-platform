import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';

const PORT = parseInt(process.env.PORT || '3001');
const VERSION = process.env.VERSION || 'dev';

const IS_DEV = process.env.NODE_ENV === 'development';
const GENERATE_DOCS = process.env.GENERATE_DOCS === 'true';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    abortOnError: false
  });

  await OpenApiNestFactory.configure(app, swaggerConfig, {
    webServerOptions: {
      enabled: true,
      path: '/docs',
    },
    fileGeneratorOptions: {
      enabled: IS_DEV,
      outputFilePath: './openapi.yaml',
    },
    clientGeneratorOptions: {
      enabled: IS_DEV,
      type: 'typescript-axios',
      outputFolderPath: '../front-end/src/lib/api-client',
      additionalProperties:
        'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
      openApiFilePath: './openapi.yaml', // or ./openapi.json
      skipValidation: true, // optional, false by default
    },
  });
}
bootstrap();
