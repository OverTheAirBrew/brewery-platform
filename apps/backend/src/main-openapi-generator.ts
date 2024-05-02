import { NestFactory } from '@nestjs/core';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    abortOnError: false,
  });

  await OpenApiNestFactory.configure(app, swaggerConfig, {
    webServerOptions: {
      enabled: true,
      path: '/docs',
    },
    fileGeneratorOptions: {
      enabled: true,
      outputFilePath: './openapi.yaml',
    },
    clientGeneratorOptions: {
      enabled: true,
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
