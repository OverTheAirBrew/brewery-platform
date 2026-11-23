import { Global, Module } from '@nestjs/common';
import { JsonSchemaGeneratorService } from './json-schema-generator.service';

@Global()
@Module({
  providers: [JsonSchemaGeneratorService],
  exports: [JsonSchemaGeneratorService],
})
export class JsonSchemaGeneratorModule {}
